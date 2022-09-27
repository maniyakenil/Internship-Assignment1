require('dotenv').config()

const express = require('express');

const cookieParser = require('cookie-parser')

const app = express();

// Google Auth
const {OAuth2Client} = require('google-auth-library');


const CLIENT_ID = '379642631602-h854sa45e59s1d0dta76nvv4so4bjeo4.apps.googleusercontent.com'

const client = new OAuth2Client(CLIENT_ID);

//Using MVC STRUCTURE
const PORT = 8000;

// Middleware

app.set('view engine', 'ejs');
app.use(cookieParser());

app.use(express.json());

app.use(express.static('public'));

app.get('/', (req, res)=>{
    res.render('index')
})

app.get('/login', (req,res)=>{
    res.render('login');
})

app.post('/login', (req,res)=>{
    let token = req.body.token;

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
      }
      verify()
      .then(()=>{
          res.cookie('session-token', token);
          res.send('success')
      })
      .catch(console.error);

})

app.get('/profile', AUTHCHECK, (req, res)=>{
    let user = req.user;
    res.render('profile', {user});
})

app.get('/protectedRoute', AUTHCHECK, (req,res)=>{
    res.send('This route is protected')
})

app.get('/logout', (req, res)=>{
    res.clearCookie('session-token');
    res.redirect('/login')

})


function AUTHCHECK(req, res, next){

    let token = req.cookies['session-token'];

    let user = {};
	
	
    async function toverify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
      }
      toverify()
      .then(()=>{
          req.user = user;
          next();
      })
      .catch(err=>{
          res.redirect('/login')
      })

}


app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})