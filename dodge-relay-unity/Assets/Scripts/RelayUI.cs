// Immediate-mode UI deliberately avoids external UI packages and assets.
// It allows an Editor host and one standalone client to play on the same LAN.
using Unity.Netcode;
using Unity.Netcode.Transports.UTP;
using UnityEngine;

namespace Relay02
{
    public sealed class RelayUI : MonoBehaviour
    {
        [SerializeField] private RelayMatch match;
        [SerializeField] private string hostIP = "127.0.0.1";
        [SerializeField] private ushort port = 7777;
        private float _smoothX = .5f, _smoothY = .5f;
        private float _smoothTargetX = .72f, _smoothTargetY = .44f;
        private GUIStyle _label;
        private GUIStyle _large;

        private void Awake()
        {
            if (match == null) match = GetComponent<RelayMatch>();
        }

        private void Update()
        {
            if (match == null || !match.IsSpawned) return;
            // Presentation smoothing: server remains authoritative over scoring.
            float alpha = 1f - Mathf.Exp(-Time.unscaledDeltaTime * 16f);
            _smoothX = Mathf.Lerp(_smoothX, match.PilotX.Value, alpha);
            _smoothY = Mathf.Lerp(_smoothY, match.PilotY.Value, alpha);
            _smoothTargetX = Mathf.Lerp(_smoothTargetX, match.TargetX.Value, alpha);
            _smoothTargetY = Mathf.Lerp(_smoothTargetY, match.TargetY.Value, alpha);
        }

        private void MakeStyles()
        {
            if (_label != null) return;
            _label = new GUIStyle(GUI.skin.label) { fontSize = 17, normal = { textColor = Color.white } };
            _large = new GUIStyle(GUI.skin.label) { fontSize = 26, fontStyle = FontStyle.Bold, normal = { textColor = new Color(.5f,.95f,.77f) } };
        }
        private static void RectFill(Rect r, Color c)
        {
            var previous = GUI.color;
            GUI.color = c;
            GUI.DrawTexture(r, Texture2D.whiteTexture);
            GUI.color = previous;
        }

        private void OnGUI()
        {
            MakeStyles();
            float w = Screen.width, h = Screen.height;
            RectFill(new Rect(0,0,w,h),new Color(.035f,.082f,.060f));
            GUI.Label(new Rect(20,15,w-40,38),"RELAY / 02     ·     UNITY NETWORKED GAMEPLAY",_large);
            NetworkManager n = NetworkManager.Singleton;
            if (n == null)
            {
                GUI.Label(new Rect(20,74,w-40,35),"No NetworkManager. Rebuild demo scene from the RELAY / 02 menu.",_label);
                return;
            }
            if (!n.IsListening)
            {
                GUI.Label(new Rect(20,65,w-40,30),"Run two builds on the same LAN: start HOST, then join as CLIENT.",_label);
                GUI.Label(new Rect(20,104,180,28),"Server address",_label);
                hostIP=GUI.TextField(new Rect(180,100,240,32),hostIP);
                if (GUI.Button(new Rect(20,150,175,42),"HOST / PILOT A"))
                {
                    n.GetComponent<UnityTransport>().SetConnectionData("127.0.0.1",port,"0.0.0.0");
                    n.StartHost();
                }
                if (GUI.Button(new Rect(210,150,175,42),"CLIENT / PILOT B"))
                {
                    n.GetComponent<UnityTransport>().SetConnectionData(hostIP,port);
                    n.StartClient();
                }
                return;
            }
            if (GUI.Button(new Rect(w-130,15,110,36),"Disconnect")) n.Shutdown();
            if (match == null || !match.IsSpawned)
            {
                GUI.Label(new Rect(20,75,w-40,35),"Waiting for network scene synchronization...",_label);
                return;
            }
            GUI.Label(new Rect(20,70,w-40,28),n.IsHost?"HOST · A/D or left/right":"CLIENT · W/S or up/down",_label);
            GUI.Label(new Rect(20,105,w-40,32),$"SCORE  {match.Score.Value}       COMBO  x{match.Combo.Value}       ROUND  {match.Seconds.Value:0.0}s       MODE  {PhaseName(match.Phase.Value)}",_label);
            if(n.IsServer&&GUI.Button(new Rect(w-165,95,145,32),"Restart round"))match.ResetRound();
            var r = new Rect(35,157,w-70,Mathf.Max(220,h-197));
            RectFill(r,new Color(.062f,.16f,.12f));
            var tx=r.x+r.width*_smoothTargetX; var ty=r.y+r.height*_smoothTargetY;
            var hx=r.x+r.width*match.DecoyX.Value;var hy=r.y+r.height*match.DecoyY.Value;
            var cx=r.x+r.width*_smoothX;var cy=r.y+r.height*_smoothY;
            RectFill(new Rect(cx-1,r.y,2,r.height),new Color(.5f,.95f,.77f,.5f));
            RectFill(new Rect(r.x,cy-1,r.width,2),new Color(.5f,.95f,.77f,.5f));
            RectFill(new Rect(tx-13,ty-13,26,26),new Color(.49f,.95f,.75f));
            RectFill(new Rect(hx-19,hy-19,38,38),new Color(1f,.5f,.59f));
            RectFill(new Rect(hx-13,hy-13,26,26),new Color(.062f,.16f,.12f));
            RectFill(new Rect(cx-9,cy-9,18,18),Color.white);
            if(match.Phase.Value!=1)
                GUI.Label(new Rect(r.x+18,r.y+20,r.width-36,40),match.Phase.Value==3?"ROUND COMPLETE":"WAITING FOR TWO CONNECTED PLAYERS",_large);
            GUI.Label(new Rect(r.x+18,r.y+r.height-37,r.width-36,32),"TEAL: hold intersection for 0.25s   •   PINK: avoid   •   Server-authoritative scoring",_label);
        }
        private static string PhaseName(int p) => p switch {1=>"PLAYING",2=>"PAUSED",3=>"FINISHED",_=>"WAITING"};
    }
}
