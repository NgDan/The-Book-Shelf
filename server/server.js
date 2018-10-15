const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const config = require('./config/config').get(process.env.NODE_ENV);
const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE);

//make sure you use bodyParser and cookieParser before setting the routes
// api/logout route needs the cookie parser

app.use(bodyParser.json());
app.use(cookieParser());

const {User} = require('./models/user');
const {Book} = require('./models/book');
const {auth} = require('./middleware/auth');



const book1 = new Book({
	name:"book amazing",
    author:5,
    review:"best book",
    pages:"200",
    rating:"5",
    price:"100",
    ownerId:"1"
});


// POST


app.post('/api/book', (req, res)=>{
    const book = new Book(req.body);

    book.save((err, doc)=>{
        if(err) return res.status(400).send(err);
        res.status(200).json({
            post:true,
            bookId: doc._id
        })
    })
})

app.post('/api/register', (req, res)=>{
    const user = new User(req.body);

    user.save((err, doc)=>{
        if(err) return res.json({success:false});
        res.status(200).json({
            success:true,
            user: doc
        })
    })
})

app.post('/api/login',(req,res)=>{
    User.findOne({'email':req.body.email},(err,user)=>{
        if(!user) return res.json({isAuth:false,message:'email not found'});

       user.comparePassword(req.body.password,(err,isMatch)=>{
           if(!isMatch) return res.json({
               isAuth:false,
               message:'Wrong password'
           });

           user.generateToken((err,user)=>{
               if(err) return res.status(400).send(err);
               //creates a cookie named 'auth' and sends the token with it
               res.cookie('auth',user.token).send({
                    isAuth:true,
                    id:user._id,
                    email:user.email
               })

           })
       })
    })
})

app.post('/api/book_update',(req,res)=>{
    Book.findByIdAndUpdate(req.body._id,req.body,{new:true},(err,doc)=>{
        if(err) return res.status(400).send(err);
        res.json({
            success:true,
            doc
        })
    })
})

app.get('/api/getBook', (req, res)=>{
    let id = req.query.id;

    Book.findById(id,(err,doc)=>{
        if(err) return res.status(400).send(err);
        console.log('got');
        res.send(doc);
    })
})

app.get('/api/books', (req, res)=>{
    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let order = req.query.order;


    Book.find().skip(skip).sort({_id:order}).limit(limit).exec((err,doc)=>{
        if(err) return res.status(400).send(err);
        res.send(doc);
    })
})

app.get('/api/getReviewer',(req,res)=>{
    let id= req.query.id;

    User.findById(id,(err,doc)=>{
        if(err) return res.status(400).send(err);
        res.json({
            name: doc.name,
            lastname: doc.lastname
        });
    })
})
//since the object inside .find({}) is empty, you will fetch ALL the users so be careful with that. 
app.get('/api/users',(req,res)=>{
    User.find({},(err,users)=>{
        if(err) return res.status(400).send(err);
        res.status(200).send(users)
    })
})

app.get('/api/user_posts',(req,res)=>{
    Book.find({ownerId:req.query.user}).exec((err,docs)=>{
        if(err) return res.status(400).send(err);
        res.send(docs);
    })
})


// the auth middleware checks if user is logged in via the token and returns the user. Then we update the user deleting the token with
// deleteToken method
app.get('/api/logout',auth,(req,res)=>{
    req.user.deleteToken(req.token,(err,user)=>{
        if(err) return res.status(400).send(err);
        res.sendStatus(200);
    })
})

app.get('/api/auth',auth,(req,res)=>{
    res.json({
        isAuth:true,
        id:req.user._id,
        email:req.user.email,
        name:req.user.name,
        lastname:req.user.lastname
    })
})

app.delete('/api/delete_book',(req,res)=>{
    let id = req.query.id;

    Book.findByIdAndRemove(id,(err,doc)=>{
        if(err) return res.status(400).send(err);
        res.json(true);
    })
})


const port = process.env.PORT || 3001;
app.listen(port,()=>{
    console.log('server running');
})