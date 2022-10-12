const User = require('../models/user')
const Document = require('../models/documents')
const Intern = require('../models/internship')
const InternReg = require('../models/intern_register')
const Project = require('../models/projects');
const passport = require('passport')
const bcrypt = require('bcrypt')
const multer = require('multer')

const { check, validationResult } = require('express-validator')

const express = require('express');
const Supervisor = require('../models/supervisors');
const router = express.Router()


/* check if user is logged in */
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}

router.get('/dashboard', isLoggedIn, (req, res, next) => {
    Promise.all([
        Intern.find().sort({'createdAt': -1}).limit(3), 
        Project.find().sort({'createdAt': -1}).limit(3), 
        Document.find().sort({'createdAt': -1}).limit(3),
        Supervisor.find().sort({'createdAt': -1}),
        InternReg.find().sort({'createdAt': -1})
                                                    ]).then(([internResult, projectResult, documentResult, supervisorResult, internRegResult]) => {
        // console.log([internResult, projectResult, documentResult])
        res.render('std/dashboard', {
            interns: internResult,
            documents: documentResult,
            projects: projectResult,
            supervisors: supervisorResult,
            internRegs : internRegResult
        });
    }).catch((err) => {
        console.log(err)
    })
})

router.get('/profile', isLoggedIn, (req, res, next) => {
    User.findById(
        req.user.id
    ).then((result) => {
        res.render('std/profile', { user: result })
    }).catch(() => {

    })
})

router.get('/login', (req, res, next) => {
    res.render('login')
})

router.post('/login', async(req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/redirectLogin',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/redirectLogin', (req, res) => {
    if(req.user.user_type === "student"){ //replace role with whatever you're checking
        res.redirect('/dashboard')
    } else {
        res.redirect('/admin/dashboard')    
    }
})
router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register', [

    check('firstname', 'firstname is required').notEmpty(),
    check('lastname', 'lasttname is required').notEmpty(),
    check('school', 'school is required').notEmpty(),
    check('course', 'course is required').notEmpty(),
    check('email', 'Email is not valid').isEmail(),
    check('password', 'Password is required').notEmpty(),
    check('password_confirm').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }),

], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(req.body), res.render('register', {
            errors: errors.array()
        }, console.log(errors));
    } else {
        // console.log(req.body)
        const salt = bcrypt.hash(req.body.password, 10).then((hash) => {
            console.log(hash)
            const user = new User({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                school: req.body.school,
                course: req.body.course,
                email: req.body.email,
                password: hash
            })
            user.save()
                .then((value) => {
                    console.log(value)
                    res.redirect('/login');
                    req.flash('success_msg', 'You have now registered!')
                })
                .catch(value => console.log(value));
        })


    }
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '/tmp/my-uploads')
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

//Configuration for Multer
var filename = "";
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        filename = `${file.fieldname}-${Date.now()}.${ext}`
        cb(null, filename);
    },
});

// Multer Filter
const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "pdf") {
        cb(null, true);
    } else {
        cb(new Error("Not a PDF File!!"), false);
    }
};

//Calling the "multer" Function
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});


router.post('/add_document', upload.single('cert'), [

    check('d_name', 'Document nameis required').notEmpty(),
    check('experience', 'experience is required').notEmpty(),

], (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(req.body), res.redirect('/dashboard', {
            errors: errors.array()
        }, console.log(errors));
    } else {
        console.log(req.file);
        console.log(filename)

        const document = new Document({
            d_name: req.body.d_name,
            f_name: filename,
            experience: req.body.experience,
            user_id: req.user.id
        })
        document.save()
            .then((value) => {
                console.log(value)
                res.redirect('/dashboard');
                req.flash('success_msg', 'You have now registered!')
            })
            .catch(value => console.log(value));
    }
})

router.post('/edit_document', [

    check('d_name', 'Document nameis required').notEmpty(),
    check('experience', 'experience is required').notEmpty(),

], (req, res, next) => {
    let id = req.body.document_id;
    let d_name = req.body.d_name;
    let experience = req.body.experience;
    let errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        console.log(req.body), res.redirect('/dashboard', {
            errors: errors.array()
        }, console.log(errors));
    } else {
        Document.findOneAndUpdate({_id: id}, {$set:{d_name: d_name, experience: experience}}, {new: true}, (err, doc) => {
            if (err) {

                console.log(err);
            }else{
                console.log(doc);
                res.redirect('/dashboard');
                req.flash('success_msg', 'You have now registered!')
            }
        });
    }
})


router.post('/register_internship', [

    check('name', 'Your name is required').notEmpty(),
    check('company', 'company is required').notEmpty(),
    check('contact', 'contact is required').notEmpty(),
    check('supervisor', 'Experience is required').notEmpty(),

], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(req.body), res.redirect('/dashboard', {
            errors: errors.array()
        }, console.log(errors));
    } else {
        const internReg = new InternReg({
            company: req.body.company,
            name: req.body.name,
            contact: req.body.contact,
            supervisor: req.body.supervisor,
            user_id: req.user.id
        })
        internReg.save()
            .then((value) => {
                console.log(value)
                res.redirect('/dashboard');
                req.flash('success_msg', 'You have now registered!')
            })
            .catch(value => console.log(value));
    }
})

router.get('/all_internReg', isLoggedIn, (req, res, next) => {
    InternReg.find().sort({'createdAt': -1}).then((result) => {
        console.log(result)
        res.render('std/reg_intern', { internRegs: result })
    }).catch((error) => {
           console.log(error)
    })
})

router.post('/add_internship', [

    check('company', 'Company name nameis required').notEmpty(),
    check('role', 'Role is required').notEmpty(),
    check('task', 'Task is required').notEmpty(),
    check('experience', 'Experience is required').notEmpty(),
    check('duration', 'Duration is required').notEmpty(),

], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(req.body), res.redirect('/dashboard', {
            errors: errors.array()
        }, console.log(errors));
    } else {
        const intern = new Intern({
            company: req.body.company,
            role: req.body.role,
            task: req.body.task,
            duration: req.body.duration,
            experience: req.body.experience,
            user_id: req.user.id
        })
        intern.save()
            .then((value) => {
                console.log(value)
                res.redirect('/dashboard');
                req.flash('success_msg', 'You have now registered!')
            })
            .catch(value => console.log(value));
    }
})

router.post('/edit_internship', [

    check('company', 'Company name is required').notEmpty(),
    check('role', 'Role is required').notEmpty(),
    check('task', 'Task is required').notEmpty(),
    check('experience', 'Experience is required').notEmpty(),
    check('duration', 'Duration is required').notEmpty(),

], (req, res) => {
    let id = req.body.internship_id;
    console.log(req.body)

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(req.body), res.redirect('/dashboard', {
            errors: errors.array()
        }, console.log(errors));
    } else {
        Intern.findOneAndUpdate({_id: id}, 
        {$set:{
            company: req.body.company,
            role: req.body.role,
            task: req.body.task,
            duration: req.body.duration,
            experience: req.body.experience,
        }}, 
        {new: true}, (err, doc) => {
            if (err) {

                console.log(err);
            }else{
                console.log(doc);
                res.redirect('/dashboard');
                req.flash('success_msg', 'You have now registered!')
            }
        });
   
    }
})



router.post('/add_project', [

    check('p_name', 'Project name nameis required').notEmpty(),
    check('description', 'Description is required').notEmpty(),
    check('url', 'A url link for your project is required').notEmpty(),
    check('duration', 'Duration is required').notEmpty(),

], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(req.body), res.redirect('/dashboard', {
            errors: errors.array()
        }, console.log(errors));
    } else {
        const project = new Project({
            p_name: req.body.p_name,
            description: req.body.description,
            url: req.body.url,
            duration: req.body.duration,
            user_id: req.user.id
        })
        project.save()
            .then((value) => {
                console.log(value)
                res.redirect('/dashboard');
                req.flash('success_msg', 'You have now registered!')
            })
            .catch(value => console.log(value));
    }
});

router.post('/edit_project', [

    check('p_name', 'Project name nameis required').notEmpty(),
    check('description', 'Description is required').notEmpty(),
    check('url', 'A url link for your project is required').notEmpty(),
    check('duration', 'Duration is required').notEmpty(),

], (req, res) => {
    let id = req.body.project_id;
    console.log(req.body)
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(req.body), res.redirect('/dashboard', {
            errors: errors.array()
        }, console.log(errors));
    } else {
        Project.findOneAndUpdate({_id: id}, 
            {$set:{
                p_name: req.body.p_name,
                description: req.body.description,
                url: req.body.url,
                duration: req.body.duration,
            }}, 
            {new: true}, (err, doc) => {
                if (err) {
                    console.log(err);
                }else{
                    console.log(doc);
                    res.redirect('/dashboard');
                    req.flash('success_msg', 'You have now registered!')
                }
            });
    }
});

router.delete('/delete_document/:id', isLoggedIn ,(req, res) => {
    let id = req.params.id;
    // console.log(id)
    Document.deleteOne({ _id: id })
        .then(() => {
            res.json({ success: true });
        })
        .catch(err => {
            res.status.json({ err: err });
        });
});

router.delete('/delete_project/:id', isLoggedIn ,(req, res) => {
            let id = req.params.id;
            console.log(id)
            Project.deleteOne({ _id: id })
                .then(() => {
                    res.json({ success: true });
                })
                .catch(err => {
                    res.status.json({ err: err });
        });
    });


router.delete('/delete_internship/:id', isLoggedIn ,(req, res) => {
            let id = req.params.id;
            console.log(id)
            Intern.deleteOne({ _id: id })
                .then(() => {
                    res.json({ success: true });
                })
                .catch(err => {
                    res.status.json({ err: err });
                });
});


router.get('/internship_deatail/:id', isLoggedIn ,(req, res) => {
    let id = req.params.id;
    console.log(id)
    Intern.findById(id).then((result) => {
        res.render('std/intern_details', { intern: result })
    }).catch((error) => {
           console.log(error)
    })
  
});

router.get('/all_internship',isLoggedIn ,(req, res) => {
    Intern.find().sort({'createdAt': -1}).then((result) => {
        console.log(result)
        res.render('std/all_internships', { interns: result })
    }).catch((error) => {
           console.log(error)
    })
  
})

router.get('/project_deatail/:id', isLoggedIn ,(req, res) => {
    let id = req.params.id;
    console.log(id)
    Project.findById(id).then((result) => {
        res.render('std/project_details', { project: result })
    }).catch((error) => {
           console.log(error)
    })
  
});

router.get('/all_project',isLoggedIn,(req, res) => {
    Project.find().sort({'createdAt': -1}).then((result) => {
        console.log(result)
        res.render('std/all_projects', { projects: result })
    }).catch((error) => {
           console.log(error)
    })
 
})

router.get('/document_deatail/:id', isLoggedIn ,(req, res) => {
    let id = req.params.id;
    console.log(id)
    Document.findById(id).then((result) => {
        res.render('std/document_details', { document: result })
    }).catch((error) => {
           console.log(error)
    })
  
});

router.get('/all_document',isLoggedIn ,(req, res) => {
    Document.find().sort({'createdAt': -1}).then((result) => {
        console.log(result)
        res.render('std/all_documents', { documents: result })
    }).catch((error) => {
           console.log(error)
    })
 
})

router.get('/summary', (req, res)=>{

 res.render('admin/summary')

})

router.get('/cv/:id', (req, res)=>{
    let id = req.params.id;
    console.log(id)
    Promise.all([User.findById(id), Intern.find().sort({'createdAt': -1}), Project.find().sort({'createdAt': -1}), Document.find().sort({'createdAt': -1})]).then(([ UserResult,internResult, projectResult, documentResult]) => {
        // console.log([internResult, projectResult, documentResult])
        res.render('std/cv', {
            user: UserResult,
            interns: internResult,
            documents: documentResult,
            projects: projectResult
        });
    }).catch((err) => {
        console.log(err)
    })
   
})

   module.exports = router
