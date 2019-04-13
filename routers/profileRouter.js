const Admin = require('../models/adminModel')
const Member = require('../models/memberModel')
const Partner = require('../models/partnerModel')
const Event = require('../models/eventModel');

const Joi = require('joi');
const schemas = require('../models/Schemas/schemas');
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
router.use(bodyParser.json()); //parsing out json out of the http request body
router.use(bodyParser.urlencoded({ extended: true })) //handle url encoded data

//user story 12 returning user detatils to display his profile
router.get('/:id', function (req, res, next) {
    var userType = req.get('userType'); //should come from session
    var userId = req.get('userId'); //should come from session
    var profId = req.params.id;
    if (profId == userId) {       //user viewing his profile
        if (userType == 'Admin') {
            Admin.findById({ _id: profId }, function (err, adminDoc) {
                if (err) next(err);
                return res.send(adminDoc);
            });
        }
        else if (userType == 'Partner') {
            Partner.findById({ _id: profId }, function (err, partnerDoc) {
                if (err) next(err);
                return es.send(partnerDoc);
            });
        }
        else if (userType == 'Member') {
            Member.findById({ _id: profId }, function (err, memberDoc) {
                if (err) next(err);
                return res.send(memberDoc);
            })
        }
    }
    else {                        //user viewing other's profile
        Member.findById(profId, '-username -password -notifications -membershipExpiryDate', function (err, memberDoc) {
            if (err) next(err);
            if (memberDoc) {
                return res.send(memberDoc);
            }
            else {
                Partner.findById(profId, '-username -password -notifications -membershipExpiryDate', function (err, partnerDoc) {
                    if (err) next(err);
                    if (partnerDoc) {
                        return res.send(partnerDoc);
                    }
                    else {
                        Admin.findById(profId, 'fname lname events', function (err, adminDoc) {
                            if (err) next(err);
                            if (adminDoc) {
                                return res.send(adminDoc);
                            }
                            else {
                                return res.status(404).send('profile not found')
                            }
                        })
                    }
                })
            }
        })
    }
})

//user story 8: As a Member I can post feedback to a Partner I previously worked with
router.post('/:id/feedback', function (req, res) {
    var userType = req.body.userType; //should come from session (has to be Member)
    var userID = req.body.userID;    //should come from session (the writer of the feedback comment)
    var partnerID = req.params.id;
    var comment = req.body.comment;
    if (userType == 'Member') {
        Partner.findById(partnerID).exec(function (err, partner) {
            partner.feedbacks.push({
                text: comment,
                member: userID
            });
            partner.save();
        }).then(console.log("Added feedback ;)"));
        return res.send("Feedback added");
    }
});

//user story 20: As a Partner I can update my profile (Board Members, Pending vacancies, Password, Pending events).
router.put('/:id', function (req, res) {
    var userType = req.body.userType; //should come from session
    var userID = req.body.userID; //should come from session (person logged in)
    var partnerID = req.params.id; //the ID of the partner I want to update
    var pwd; var members; var oldPassword;
    if (req.body.boardMembers) {
        members = req.body.boardMembers;
    }
    if (req.body.password && req.body.oldPassword) {
        pwd = req.body.password;
        oldPassword = req.body.oldPassword;
    }
    if (userType == 'Partner') {
        if (partnerID == userID) {
            Partner.findById(partnerID).exec(function (err, partner) {
                if (members) {
                    partner.boardMembers = members;
                }
                if (pwd && oldPassword === partner.password) {
                    partner.password = pwd;
                }
                else 
                    console.log("You provided an wrong old password");
                res.send(partner);
                partner.save();
                console.log("Updated partner profile successfully");
            });
        }
    }
    else
        res.send("Error. You are not a partner");
});

//user stories 1 & 2: creating member or partner profiles
router.post('/create', function (req, res) {
    var userType = req.body.userType;
    if (userType == 'Partner') {
        var usern = req.body.username;
        var pwd = req.body.password;
        var n = req.body.name;
        var em = req.body.email;
        var wf = req.body.workfield
        
        const result = Joi.validate(req.body, schemas.partnerSchema);
	    if (result.error) return res.status(400).send({ error: result.error.details[0].message });

        var newPartner = new Partner({
            username: usern,
            password: pwd,
            name: n,
            email: em,
            workfield: wf
        });
        newPartner.ProfileURL = '/api/profile/' + newPartner._id;
        newPartner.save(function (err, p) {
            if (err) throw err;
            console.log(p);

        });
        res.send("Added a partner")
    }
    if (userType == 'Member') {
        var usern = req.body.username;
        var pwd = req.body.password;
        var em = req.body.email;
        var fn = req.body.fname;
        var ln = req.body.lname;
        var add = req.body.address;
        var skls = req.body.skills;
        var mc = req.body.masterclasses;
        var cert = req.body.certificates;
        var intst = req.body.interests;
        //var tsks = req.body.tasks;
        //var prjs = req.body.projects

        const result = Joi.validate(req.body, schemas.memberSchema);
        if (result.error) return res.status(400).send({ error: result.error.details[0].message });
        
        var newMember = new Member({
            username: usern,
            password: pwd,
            email: em,
            fname: fn,
            lname: ln,
            address: add,
            skills: skls,
            masterclasses: mc,
            certificates: cert,
            interests: intst,
            //tasks: tsks,
            // projects: prjs
        });
        newMember.ProfileURL = '/api/profile/' + newMember._id;

        newMember.save(function (err, m) {
            if (err) throw err;
            console.log(m);

        });
        res.send("Added a member");
    }
});

//As an admin i can i can update my name story#30
router.put('/:id/name', function (req, res) {
    var userType = req.body.userType;
    var userId = req.params.id;
    var fname = req.body.fname;
    var lname = req.body.lname;
    if (userType == 'Admin') {
        Admin.findByIdAndUpdate(userId, { fname: fname, lname: lname },
            function (err, response) {
                console.log(response);
            });
    }
    return res.send("Name Updated");
});

//As an admin i can update my password story#30
router.put('/:id/password', function (req, res) {
    var userType = req.body.userType;
    var userId = req.params.id;
    var password = req.body.password;
    if (userType == 'Admin') {
        Admin.findByIdAndUpdate(userId, { password: password },
            function (err, response) {
                console.log(response);
            });
    }
    return res.send("Password Updated");
});

//add feedback to partner
router.put('/:id/feedback', function (req, res) {

    var userType = req.body.userType; //should come from session
    var userId = req.body.userId;    //should come from session
    var feedback = req.body.feedback;
    var memberId = req.params.id;
    console.log(memberId);
    if (userType == 'Partner') {
        Member.findById(memberId)
            .exec(function (err, member) {

                member.reviews.push({
                    text: feedback,
                    partner: userId
                });
                member.save(); //DON'T FORGET TO SAVE DOCUMENT INTO DATABASE
                console.log(member);
            });
        Member.findById(memberId) //notify the member
            .exec(function (err, member) {
                member.notifications.push({
                    srcURL: '/api/feedback/' + memberId,
                    description: 'Partner reviewed your performance in his vacancy'
                });
                console.log(member)
                member.save();
            });
    } else { res.send("only partners can add feedback"); }

    res.send("finished");

});

router.put('/:id/update', function (req, res) {
    var userTypeU = req.body.userType; //should come from session
    var userId = req.body.userId;    //should come from session
    var memberId = req.params.id;

    var addressU = req.body.address;
    var lnameU = req.body.lname;
    var fnameU = req.body.fname;
    var passwordU = req.body.password;
    var interestsU = req.body.interests;
    var skillsU = req.body.skills;
    var memberStateU = req.body.memberState;
    var membershipExpiryDateU = req.body.membershipExpiryDate;

    //Address, Name, Password, Skills, Interests


    if (userTypeU == 'Member' && userId == memberId) {
        Member.findById(memberId)
            .exec(function (err, doc) {
                console.log(doc);
                doc.address = addressU;
                doc.lname = lnameU;
                doc.fname = fnameU;
                doc.password = passwordU;
                doc.interests = interestsU;
                doc.skills = skillsU;

                doc.save();
            });



    }
    //Membership Expiry Date, Member State
    else if (userTypeU == 'Admin') {
        Member.findById(memberId)
            .exec(function (err, doc) {

                doc.membershipExpiryDate = membershipExpiryDateU;
                doc.userType = userTypeU;
                doc.save();
            });


    }
    else { res.send("not your profile") }


    res.send('updated');

});

//As a member I can mark myself as going to an event
router.put('/:id/attending', function(req, res){
    var eventID = req.params.id;
    var userID = req.body.userID;
    var userType = req.body.userType;
    if(userType === 'Member'){
        Event.findById(eventID).exec(function (err, event){
            event.attendees.push(userID);
            event.remainingPlaces = event.remainingPlaces - 1;
            event.save();
        });
        res.send("Marked you as attending");
    }
});

//As a member I can mark myself as not going to an event that I 
//previously marked myself as going to
router.put('/:id/notAttending', function(req, res){
    var eventID = req.params.id;
    var userID = req.body.userID;
    var userType = req.body.userType;
    if(userType === 'Member'){
        Event.findById(eventID).exec(function (err, event){
            event.attendees.pull(userID);
            event.remainingPlaces = event.remainingPlaces + 1;
            event.save();
        });
        res.send("Marked you as not-attending");
    }
});

module.exports = router;
