//Require the express package and use express.Router()
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
const user = require('../models/user');

router.get('/:un?', (req, res) => {
    let uname = req.params.un;
    console.log(`GET\t${uname}`);
    if (typeof uname === 'undefined') {
        user.getAll((err, users) => {
            if (err) {
                res.json({ success: false, message: `Failed to load users. Error: ${err}` });
            }
            else {
                res.json({ success: true, users: users });
                //res.write(JSON.stringify({success: true, users:users},null,2));
                res.end();
            }
        });
    } else {
        user.get({ username: uname }, (err, u) => {
            if (err) {
                res.json({ success: false, message: `Failed to load users. Error: ${err}` });
            }
            else if (!u) {
                res.json({ success: false, message: `Failed to load users. Error: No user with username ${uname}` });
            }
            else {
                res.json({ success: true, user: u });
                res.end();
            }
        });
    }
});
router.post('/auth', (req, res) => {
    username = req.body.username;
    password = req.body.username;
    user.get({ username: username }, (err, u) => {
        if (err) {
            res.json({ success: false, message: `Failed to load users. Error: ${err}` });
        }
        else if (!u) {
            res.json({ success: false, message: `Failed to load users. Error: No user with username ${username}` });
        }
        else {
            bcrypt.compare(password, u.pass, function (err, r) {
                console.log(u.pass, password);
                if (err) {
                    res.json({ success: false, message: `Failed to authenticate user. Error: ${err}\n` });
                }
                else if (!r) {
                    res.json({ success: false, message: `Failed to authenticate user. Error: ${err}\n${u}` });
                }
                else {
                    res.json({ success: true, message: "Authenticated successfully." });
                }
            });
        }
    })
})
router.post('/new', (req, res) => {
    bcrypt.hash(req.body.pass, 10, function (err, hash) {
        if (err) { throw (err); }

        bcrypt.compare(req.body.pass, hash, function (err, result) {
            if (err) { throw (err); }
            let newUser = new user({
                name: req.body.name,
                email: req.body.email,
                pass: hash,
                grade: req.body.grade,
                sec: req.body.sec,
                status: req.body.status,
                username: req.body.username
            });
            console.log(`REG\t${newUser}`);
            user.register(newUser, (err, u) => {
                if (err) {
                    res.json({ success: false, message: `Failed to create a new user. Error: ${err}\n ${newUser}` });
                }
                else
                    res.json({ success: true, message: "Added successfully." });

            });
        });
    });
});
router.post('/edit/:id', (req, res) => {
    let id = req.params.id;
    let update = req.body.update;
    (async function(){
        if(req.body.update.pass) {
            const h = await bcrypt.hash(req.body.update.pass, 10)//, function (err, hash) {
            //     if (err) { throw (err); }
        
            //     bcrypt.compare(req.body.update.pass, hash, function (err, result) {
            //         if (err) { throw (err); }
            //         if(result) update.pass = hash;
            //         console.log(JSON.stringify(update), result);
            //         return hash;
            //     });
            // });
            update.pass = h;
        }
    
        console.log(`UPDATE ${id}\t${JSON.stringify(update)}`);
        await user.edit({ _id: id }, update, (err, updatedUser) => {
            if (err) {
                res.json({ success: false, message: `Failed to update user. Error: ${err}\n ${update}` });
            }
            else if (!updatedUser) {
                res.json({ success: false, message: `Failed to update user. Error: No user with id ${id}` });
            }
            else {
                res.json({ success: true, user: updatedUser });
                res.end();
            }
        })
    })().catch(err => {throw err;});
})
router.delete('/:id', (req, res) => {
    //access the parameter which is the id of the item to be deleted
    let id = req.params.id;
    console.log(`DELETE\t${id}`);
    //Call the model method delete
    user.delete(id, (err, u) => {
        if (err) {
            res.json({ success: false, message: `Failed to delete the user. Error: ${err}` });
        }
        else if (u) {
            res.json({ success: true, message: "Deleted successfully" });
        }
        else
            res.json({ success: false });
    })
});
// var salt = bcrypt.genSaltSync(saltRounds);
// console.log(salt);
module.exports = router;