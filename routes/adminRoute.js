// const Menu = require('../model/menu');
// const Food = require('../model/food');
// const User = require('../model/user')
// const Order = require('../model/orders')

const User = require('../models/user')
const Document = require('../models/documents')
const Intern = require('../models/internship')
const Project = require('../models/projects');
const Supervisor = require('../models/supervisors');
const InternReg = require('../models/intern_register')
const passport = require('passport')
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator')

const express = require('express');
const router = express.Router()


/* check if user is logged in */
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}

router.get('/admin/dashboard', isLoggedIn,(req, res) => {
    Promise.all([
        Intern.find().sort({'createdAt': -1}).limit(3), 
        Project.find().sort({'createdAt': -1}).limit(3), 
        Document.find().sort({'createdAt': -1}).limit(3),
        Supervisor.find().sort({'createdAt': -1}),
        InternReg.find().sort({'createdAt': -1})
                                ]).then(([internResult, projectResult, documentResult, supervisorResult, internRegResult]) => {
        // console.log([internResult, projectResult, documentResult])
        res.render('admin/dashboard', {
            interns: internResult,
            documents: documentResult,
            projects: projectResult,
            supervisors: supervisorResult,
            internRegs : internRegResult
        });
    }).catch((err) => {
        console.log(err)
    })  
});

// Register Proccess
router.post('/add_super', [

    check('name', 'Name is required').notEmpty(),

], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(req.body)
        res.redirect('/admin/dashboard', {
            errors: errors.array()
        });
    } else {
        // console.log(req.body)
            const supervisor = new Supervisor({
                name: req.body.name,
                user_id: req.user.id
            })
            supervisor.save()
                .then((value) => {
                    console.log(value)
                    res.redirect('/admin/dashboard');
                    req.flash('success_msg', 'You have now registered!')
                }).catch(value => console.log(value));

    }


});

router.post('/update_status', function(req, res) {
    console.log(req.body)
    InternReg.findOneAndUpdate({_id: req.body.id}, 
        {$set:{
 
            status: req.body.status,
        }}, 
        {new: true}, (err, result) => {
            if (err) {
                console.log(err);
            }else{
                res.json({
                    msg: 'success',
                    result: result
                })
            }
        })
});

router.post('/update_Fapprove', function(req, res) {
    console.log(req.body)
    InternReg.findOneAndUpdate({_id: req.body.id}, 
        {$set:{
 
            f_approval: req.body.status,
        }}, 
        {new: true}, (err, result) => {
            if (err) {
                console.log(err);
            }else{
                res.json({
                    msg: 'success',
                    result: result
                })
            }
        })
});

router.get('/internships',isLoggedIn ,(req, res) => {
    Intern.find().sort({'createdAt': -1}).then((result) => {
        console.log(result)
        res.render('admin/internships', { interns: result })
    }).catch((error) => {
           console.log(error)
    })
  
})

router.get('/students',isLoggedIn ,(req, res) => {
    User.find().sort({'createdAt': -1}).then((result) => {
        console.log(result)
        res.render('admin/students', { users: result })
    }).catch((error) => {
           console.log(error)
    })
  
})

router.delete('/delete_user/:id', isLoggedIn ,(req, res) => {
    let id = req.params.id;
    console.log(id)
    User.deleteOne({ _id: id })
        .then(() => {
            res.json({ success: true });
        })
        .catch(err => {
            res.status.json({ err: err });
        });
});




module.exports = router