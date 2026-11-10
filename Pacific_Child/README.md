#Child of the Pacific

jonghoonahn.com/pacificchild

An interactive data self-portrait in p5.js
The Pacific as the center
From 2023 through 2026, I traveled and spent time in South Korea, Japan, and the United States. My photo library held records of places on both sides of the Pacific, so I put the ocean at the center of the sketch. Around the rim are the places where I took photos or recorded videos. In the middle is a painted version of myself, curled with my knees drawn in like a fetus in a womb. I imagined the Pacific as the water holding that body. When I change the period I am looking at, my head can turn toward a different place as my body opens or curls.

From photo library to sketch
I used the capture date and GPS coordinates from my personal photo and video records. A photo and a video each count as one record. I used UTC dates to keep a record on the same day for viewers in different time zones. I grouped nearby coordinates into location cells and counted records by day and place. The built-in dataset represents 19,242 records, with usable GPS positions grouped into 321 cells. I kept the dates of records with missing coordinates. The sketch builds a continuous timeline from those dates and the GPS records, so empty periods are part of the playback.

Each cell gets an angle from the center of the Pacific and a small mark on the rim. That gave places in Jeju, Okinawa, and California their own directions. I used a plain background and left space around the figure so its movements would be easy to see. When a place is selected, its mark lights up and a small readout shows its record count. The readout includes a nearby place name when one is available.
How the portrait moves
The outermost ring is Year, followed by Month, Week, and Day. The animation starts playing when the artwork loads. I can pause it and change the playback speed. Clicking or dragging a ring takes me to a specific period. The four rings share a date, so I can change the time scale while staying near the same point in the archive. I can also click a mark on the rim to hold the date and look at that place.

By default, the head points toward the place with the most records in the current period. The share of GPS records at that place drives four levels of opening, from tightly curled to extended. With no usable location in a period, the body curls up and the eyes close. The eyes open based on how often the place appears across the days in a period. On the Day ring, the eyes use the share of that day’s records. The outfit changes with the season of the selected date.

At one point I considered a goose because a curled body and an extended neck would make the poses easy to read. I came back to my own face because I wanted the movements to belong to me. I used a face reference and broad, oil-like brushstrokes for the figure. I gave the separate parts of the painted body their own joints, then used p5.js to turn them around their pivots. As the figure opens, the whole curled image blends into those moving parts.
What I noticed
In the Year view, the figure points toward the same part of Southern California in all four years. When I switch to Month and reach July 2026, it turns toward Jeju. Seeing the same archive at both scales made it easier to notice a place I would pass over in a year of playback.

I started with the idea of showing where I spent the most time. Working with photo and video records made me pay more attention to what I chose to capture. A short trip with a lot of photos can pull the figure farther than a long stay I barely photographed. The curled pose gives the gaps in the archive a posture of their own. When there is no location to follow, the body is still there.
Run the sketch
Open index.html from the project folder with sketch.js, libraries/, art/, and rig_layers/ in place. The built-in data loads with the sketch. Add ?controls=1 to the page URL to access the GPS CSV picker and joint display. The picker reads the CSV in the browser.