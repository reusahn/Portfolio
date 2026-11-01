"""Browser tests; intentionally do not represent WebRTC Internet or Unity/Quest tests."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

HTML=Path(__file__).with_name('relay-play.html').read_text()

async def test():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        main=await browser.new_page(viewport={'width':1300,'height':1100})
        errors=[]
        main.on('pageerror',lambda e:errors.append('runtime '+str(e)))
        await main.set_content(HTML)
        await main.locator('#practice').click()
        initial=await main.evaluate('state.x')
        await main.keyboard.down('d'); await main.wait_for_timeout(400); await main.keyboard.up('d')
        moved=await main.evaluate('state.x')
        assert moved>initial+.10,('local movement failed',initial,moved)
        await main.evaluate('state.tx=state.x;state.ty=state.y;state.hx=.02;state.hy=.02')
        await main.wait_for_timeout(360)
        score=await main.evaluate('state.score')
        assert score>=100,('local scoring failed',score)
        await main.screenshot(path=str(Path(__file__).with_name('relay-game-preview.png')),full_page=True)
        print('PASS local keyboard movement and scoring. Score',score)

        # Two independently executing browser frames with the same inherited origin.
        parent=await browser.new_page()
        parent.on('pageerror',lambda e:errors.append('paired '+str(e)))
        await parent.set_content('<iframe id="host"></iframe><iframe id="guest"></iframe>')
        await parent.evaluate('(h)=>{document.getElementById("host").srcdoc=h;document.getElementById("guest").srcdoc=h}',HTML)
        host=parent.frame_locator('#host');guest=parent.frame_locator('#guest')
        await host.locator('#tabhost').click();await guest.locator('#tabjoin').click()
        await parent.wait_for_timeout(350)
        assert 'connected' in (await host.locator('#netstatus').inner_text()).lower()
        await host.locator('#practice').click()
        frames=parent.frames
        await frames[2].evaluate('touch.y=-1')
        await parent.wait_for_timeout(700)
        await frames[2].evaluate('touch.y=0')
        await parent.wait_for_timeout(100)
        stateA=await frames[1].evaluate('({phase:state.phase,y:state.y,score:state.score})')
        stateB=await frames[2].evaluate('({phase:state.phase,y:state.y,score:state.score})')
        assert stateA['phase']=='playing' and stateB['phase']=='playing', (stateA,stateB)
        assert stateA['y']<.3 and abs(stateA['y']-stateB['y'])<.001,(stateA,stateB)
        print('PASS two-client input synchronization and 20Hz host snapshot.',stateA,stateB)
        # Client-only overwrite is overridden by the host's next snapshot.
        await frames[2].evaluate('state.score=9999')
        await parent.wait_for_timeout(200)
        assert await frames[2].evaluate('state.score')==await frames[1].evaluate('state.score')
        print('PASS host-authoritative score overwrites guest tampering')
        await guest.locator('#disconnect').click()
        await parent.wait_for_timeout(180)
        assert await frames[1].evaluate('state.phase')=='paused'
        print('PASS guest disconnect pauses host round')
        assert not errors,errors
        print('PASS 0 browser exceptions')
        await browser.close()

if __name__=='__main__': asyncio.run(test())
