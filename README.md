Climb On.

I set out to build a climbing app I could call my own and have features that I believe a climbing app should have, and what I came up with was this app called Climb On!

https://github.com/juhjuhjuhgian/juhjuhjuhgian/blob/main/climb.gif

Link to project: https://climbon.onrender.com

How It's Made: Tech used: HTML, CSS, JavaScript, Express

This is a fullstack CRUD app project with protected user authentication and is based on MVC architecture. The site has been rendered using .ejs templates and dynamically styled using Bootstrap 5.

MongoDB is used to store user sessions, encrypted user login information and meeting informtion.

This project has both protected and public views. Protected views that can only be accessed upon user authentication, such as viewing the feed.

Upon login the user is taken to their profile page where they can see a history of their climbing frequency by month using chart.js, along with all of their climbing sessions. They can look at individual climbs within sessions by clicking on an individual session. 

Once the user is ready to log a climbing session, individual climbs can be added to a session - bouldering, route climbing, or both - selecting difficulty, attempts taken, whether or not the top was reached, and a number of climbing descriptors to help recall past climbs. Images can be uploaded with the help of Multer, which helps the climber recall the route/boulder.

Optimizations: Use a javascript library such as React to create the UI to leverage reusable components e.g climbing sessions on the feed and and in the user's profile. More data points for the user to log and being able to leverage those data points to show different areas of climbing progress.