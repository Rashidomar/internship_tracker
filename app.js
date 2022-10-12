const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport')
const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('connect-flash');
const multer = require('multer')
const User = require('./models/user')
const Document = require('./models/documents')
const Intern = require('./models/internship')
const Project = require('./models/projects');
const { check, validationResult } = require('express-validator');
const adminRoute = require('./routes/adminRoute')
const studentRoute = require('./routes/studentRoute')

const app = express()
const port = 3000

app.use(session({
    secret: 'something',
    saveUninitialized: true,
    resave: true
}));

app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport Config
require('./middleware/passport')(passport);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");


/* check if user is logged in */
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}

app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();
});


app.get('/', (req, res) => {
    res.render('index')
})

app.get('/contact', (req, res) => {
    res.render('contact')
})

// app.get('/dashboard', isLoggedIn, (req, res, next) => {
//     Promise.all([Intern.find().sort({'createdAt': -1}).limit(3), Project.find().sort({'createdAt': -1}).limit(3), Document.find().sort({'createdAt': -1}).limit(3)]).then(([internResult, projectResult, documentResult]) => {
//         // console.log([internResult, projectResult, documentResult])
//         res.render('std/dashboard', {
//             interns: internResult,
//             documents: documentResult,
//             projects: projectResult
//         });
//     }).catch((err) => {
//         console.log(err)
//     })
// })

// app.get('/profile', isLoggedIn, (req, res, next) => {
//     User.findById(
//         req.user.id
//     ).then((result) => {
//         res.render('std/profile', { user: result })
//     }).catch(() => {

//     })
// })

// app.get('/login', (req, res, next) => {
//     res.render('login')
// })

// app.post('/login', async(req, res, next) => {
//     passport.authenticate('local', {
//         successRedirect: '/redirectLogin',
//         failureRedirect: '/login',
//         failureFlash: true
//     })(req, res, next);
// });

// app.get('/redirectLogin', (req, res) => {
//     if(req.user.user_type === "student"){ //replace role with whatever you're checking
//         res.redirect('/dashboard')
//     } else {
//         res.redirect('/admin/dashboard')    
//     }
// })

// app.get('/logout', function(req, res, next) {
//     req.logout(function(err) {
//         if (err) { return next(err); }
//         res.redirect('/');
//     });
// });

// app.get('/register', (req, res) => {
//     res.render('register')
// })

// app.post('/register', [

//     check('firstname', 'firstname is required').notEmpty(),
//     check('lastname', 'lasttname is required').notEmpty(),
//     check('school', 'school is required').notEmpty(),
//     check('course', 'course is required').notEmpty(),
//     check('email', 'Email is not valid').isEmail(),
//     check('password', 'Password is required').notEmpty(),
//     check('password_confirm').custom((value, { req }) => {
//         if (value !== req.body.password) {
//             throw new Error('Password confirmation does not match password');
//         }
//         return true;
//     }),

// ], (req, res) => {
//     let errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         console.log(req.body), res.render('register', {
//             errors: errors.array()
//         }, console.log(errors));
//     } else {
//         // console.log(req.body)
//         const salt = bcrypt.hash(req.body.password, 10).then((hash) => {
//             console.log(hash)
//             const user = new User({
//                 firstname: req.body.firstname,
//                 lastname: req.body.lastname,
//                 school: req.body.school,
//                 course: req.body.course,
//                 email: req.body.email,
//                 password: hash
//             })
//             user.save()
//                 .then((value) => {
//                     console.log(value)
//                     res.redirect('/login');
//                     req.flash('success_msg', 'You have now registered!')
//                 })
//                 .catch(value => console.log(value));
//         })


//     }
// });

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, '/tmp/my-uploads')
//     },
//     filename: function(req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//         cb(null, file.fieldname + '-' + uniqueSuffix)
//     }
// })

// //Configuration for Multer
// var filename = "";
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads");
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split("/")[1];
//         filename = `${file.fieldname}-${Date.now()}.${ext}`
//         cb(null, filename);
//     },
// });

// // Multer Filter
// const multerFilter = (req, file, cb) => {
//     if (file.mimetype.split("/")[1] === "pdf") {
//         cb(null, true);
//     } else {
//         cb(new Error("Not a PDF File!!"), false);
//     }
// };

// //Calling the "multer" Function
// const upload = multer({
//     storage: multerStorage,
//     fileFilter: multerFilter,
// });


// app.post('/add_document', upload.single('cert'), [

//     check('d_name', 'Document nameis required').notEmpty(),
//     check('experience', 'experience is required').notEmpty(),

// ], (req, res, next) => {
//     let errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         console.log(req.body), res.redirect('/dashboard', {
//             errors: errors.array()
//         }, console.log(errors));
//     } else {
//         console.log(req.file);
//         console.log(filename)

//         const document = new Document({
//             d_name: req.body.d_name,
//             f_name: filename,
//             experience: req.body.experience,
//             user_id: req.user.id
//         })
//         document.save()
//             .then((value) => {
//                 console.log(value)
//                 res.redirect('/dashboard');
//                 req.flash('success_msg', 'You have now registered!')
//             })
//             .catch(value => console.log(value));
//     }
// })

// app.post('/edit_document', [

//     check('d_name', 'Document nameis required').notEmpty(),
//     check('experience', 'experience is required').notEmpty(),

// ], (req, res, next) => {
//     let id = req.body.document_id;
//     let d_name = req.body.d_name;
//     let experience = req.body.experience;
//     let errors = validationResult(req);
//     console.log(req.body)
//     if (!errors.isEmpty()) {
//         console.log(req.body), res.redirect('/dashboard', {
//             errors: errors.array()
//         }, console.log(errors));
//     } else {
//         Document.findOneAndUpdate({_id: id}, {$set:{d_name: d_name, experience: experience}}, {new: true}, (err, doc) => {
//             if (err) {

//                 console.log(err);
//             }else{
//                 console.log(doc);
//                 res.redirect('/dashboard');
//                 req.flash('success_msg', 'You have now registered!')
//             }
//         });
//     }
// })


// app.post('/add_internship', [

//     check('company', 'Company name nameis required').notEmpty(),
//     check('role', 'Role is required').notEmpty(),
//     check('task', 'Task is required').notEmpty(),
//     check('experience', 'Experience is required').notEmpty(),
//     check('duration', 'Duration is required').notEmpty(),

// ], (req, res) => {
//     let errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         console.log(req.body), res.redirect('/dashboard', {
//             errors: errors.array()
//         }, console.log(errors));
//     } else {
//         const intern = new Intern({
//             company: req.body.company,
//             role: req.body.role,
//             task: req.body.task,
//             duration: req.body.duration,
//             experience: req.body.experience,
//             user_id: req.user.id
//         })
//         intern.save()
//             .then((value) => {
//                 console.log(value)
//                 res.redirect('/dashboard');
//                 req.flash('success_msg', 'You have now registered!')
//             })
//             .catch(value => console.log(value));
//     }
// })

// app.post('/edit_internship', [

//     check('company', 'Company name is required').notEmpty(),
//     check('role', 'Role is required').notEmpty(),
//     check('task', 'Task is required').notEmpty(),
//     check('experience', 'Experience is required').notEmpty(),
//     check('duration', 'Duration is required').notEmpty(),

// ], (req, res) => {
//     let id = req.body.internship_id;
//     console.log(req.body)

//     let errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         console.log(req.body), res.redirect('/dashboard', {
//             errors: errors.array()
//         }, console.log(errors));
//     } else {
//         Intern.findOneAndUpdate({_id: id}, 
//         {$set:{
//             company: req.body.company,
//             role: req.body.role,
//             task: req.body.task,
//             duration: req.body.duration,
//             experience: req.body.experience,
//         }}, 
//         {new: true}, (err, doc) => {
//             if (err) {

//                 console.log(err);
//             }else{
//                 console.log(doc);
//                 res.redirect('/dashboard');
//                 req.flash('success_msg', 'You have now registered!')
//             }
//         });
   
//     }
// })



// app.post('/add_project', [

//     check('p_name', 'Project name nameis required').notEmpty(),
//     check('description', 'Description is required').notEmpty(),
//     check('url', 'A url link for your project is required').notEmpty(),
//     check('duration', 'Duration is required').notEmpty(),

// ], (req, res) => {
//     let errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         console.log(req.body), res.redirect('/dashboard', {
//             errors: errors.array()
//         }, console.log(errors));
//     } else {
//         const project = new Project({
//             p_name: req.body.p_name,
//             description: req.body.description,
//             url: req.body.url,
//             duration: req.body.duration,
//             user_id: req.user.id
//         })
//         project.save()
//             .then((value) => {
//                 console.log(value)
//                 res.redirect('/dashboard');
//                 req.flash('success_msg', 'You have now registered!')
//             })
//             .catch(value => console.log(value));
//     }
// });

// app.post('/edit_project', [

//     check('p_name', 'Project name nameis required').notEmpty(),
//     check('description', 'Description is required').notEmpty(),
//     check('url', 'A url link for your project is required').notEmpty(),
//     check('duration', 'Duration is required').notEmpty(),

// ], (req, res) => {
//     let id = req.body.project_id;
//     console.log(req.body)
//     let errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         console.log(req.body), res.redirect('/dashboard', {
//             errors: errors.array()
//         }, console.log(errors));
//     } else {
//         Project.findOneAndUpdate({_id: id}, 
//             {$set:{
//                 p_name: req.body.p_name,
//                 description: req.body.description,
//                 url: req.body.url,
//                 duration: req.body.duration,
//             }}, 
//             {new: true}, (err, doc) => {
//                 if (err) {
//                     console.log(err);
//                 }else{
//                     console.log(doc);
//                     res.redirect('/dashboard');
//                     req.flash('success_msg', 'You have now registered!')
//                 }
//             });
//     }
// });

// app.delete('/delete_document/:id', isLoggedIn ,(req, res) => {
//     let id = req.params.id;
//     // console.log(id)
//     Document.deleteOne({ _id: id })
//         .then(() => {
//             res.json({ success: true });
//         })
//         .catch(err => {
//             res.status.json({ err: err });
//         });
// });

// app.delete('/delete_project/:id', isLoggedIn ,(req, res) => {
//             let id = req.params.id;
//             console.log(id)
//             Project.deleteOne({ _id: id })
//                 .then(() => {
//                     res.json({ success: true });
//                 })
//                 .catch(err => {
//                     res.status.json({ err: err });
//         });
//     });


// app.delete('/delete_internship/:id', isLoggedIn ,(req, res) => {
//             let id = req.params.id;
//             console.log(id)
//             Intern.deleteOne({ _id: id })
//                 .then(() => {
//                     res.json({ success: true });
//                 })
//                 .catch(err => {
//                     res.status.json({ err: err });
//                 });
// });


// app.get('/internship_deatail/:id', isLoggedIn ,(req, res) => {
//     let id = req.params.id;
//     console.log(id)
//     Intern.findById(id).then((result) => {
//         res.render('std/intern_details', { intern: result })
//     }).catch((error) => {
//            console.log(error)
//     })
  
// });

// app.get('/all_internship',isLoggedIn ,(req, res) => {
//     Intern.find().sort({'createdAt': -1}).then((result) => {
//         console.log(result)
//         res.render('std/all_internships', { interns: result })
//     }).catch((error) => {
//            console.log(error)
//     })
  
// })

// app.get('/project_deatail/:id', isLoggedIn ,(req, res) => {
//     let id = req.params.id;
//     console.log(id)
//     Project.findById(id).then((result) => {
//         res.render('std/project_details', { project: result })
//     }).catch((error) => {
//            console.log(error)
//     })
  
// });

// app.get('/all_project',isLoggedIn,(req, res) => {
//     Project.find().sort({'createdAt': -1}).then((result) => {
//         console.log(result)
//         res.render('std/all_projects', { projects: result })
//     }).catch((error) => {
//            console.log(error)
//     })
 
// })

// app.get('/document_deatail/:id', isLoggedIn ,(req, res) => {
//     let id = req.params.id;
//     console.log(id)
//     Document.findById(id).then((result) => {
//         res.render('std/document_details', { document: result })
//     }).catch((error) => {
//            console.log(error)
//     })
  
// });

// app.get('/all_document',isLoggedIn ,(req, res) => {
//     Document.find().sort({'createdAt': -1}).then((result) => {
//         console.log(result)
//         res.render('std/all_documents', { documents: result })
//     }).catch((error) => {
//            console.log(error)
//     })
 
// })

// app.get('/summary', (req, res)=>{

//  res.render('admin/summary')

// })

// app.get('/cv/:id', (req, res)=>{
//     let id = req.params.id;
//     console.log(id)
//     Promise.all([User.findById(id), Intern.find().sort({'createdAt': -1}), Project.find().sort({'createdAt': -1}), Document.find().sort({'createdAt': -1})]).then(([ UserResult,internResult, projectResult, documentResult]) => {
//         // console.log([internResult, projectResult, documentResult])
//         res.render('std/cv', {
//             user: UserResult,
//             interns: internResult,
//             documents: documentResult,
//             projects: projectResult
//         });
//     }).catch((err) => {
//         console.log(err)
//     })
   
//    })

app.use(studentRoute)
app.use(adminRoute)

//remote connectionss
let mongo_remote = 'mongodb+srv://root:1234@mydatabase.g0ldg.mongodb.net/MyDatabase?retryWrites=true&w=majority'

//Set up default mongoose connection
var mongo_local = 'mongodb://127.0.0.1/pcv_db';
mongoose.connect(mongo_local, { useNewUrlParser: true, useUnifiedTopology: true }).then((result) => {

    app.listen(process.env.PORT || port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    })

})