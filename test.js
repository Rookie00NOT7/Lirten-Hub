var Vacancy = require('./models/vacancyModel');
var Admin = require('./models/adminModel');
var Partner = require('./models/partnerModel');
var Member = require('./models/memberModel');
var Event = require('./models/eventModel')

const funcs = require('./fn');
const mongoose = require('mongoose');
const config = require("./config");

// Gasser 
describe('Testing user story 20 and 21, As a partner I can edit my profile (Board members and password) and update my pending events', () => {
    // documents to perform tests on    
    let event1;
    let par1;
    beforeAll(async (done) => {
        await mongoose.connect(config.getTestingDbConnectionString(), { useNewUrlParser: true, useCreateIndex: true });
        par1 = new Partner({ username: 'testPartner', name: 'Testing', password: '12345', email: 'passwordTesterPartner@a.com' });
        event1 = new Event({
            description: "test event",
            name: "7ama2y concert",
            price: "100001",
            location: "CFC",
            city: "cairo",
            eventDate: "11/11/1991",
            remainingPlaces: "999",
            eventType: "concert",
            speakers: ["7ama2y", "a5oo"],
            topics: ["song", "intro"],
            partner: par1._id
        });
        await par1.save();
        await event1.save();
        done();
    });
    test(`Changing password. It should now be: "new_12345_password"`, async (done) => {
        const response = await funcs.updatePartnerProfileChangePassword(par1);
        expect(response).toEqual("new_12345_password");
        done();
    });
    test(`Adding 3 board members to the partner profile`, async (done) => {
        const response = await funcs.updatePartnerProfileAddBoardMembers(par1);
        expect(response).toEqual(3);
        done();
    });
    test(`Changing the remaining places of an event to be 10`, async (done) => {
        const response = await funcs.updateEventByChangingRemainingPlaces(event1, par1);
        expect(response).toEqual(10);
        done();
    });
    afterAll(async (done) => {
        setTimeout(async () => {
            await mongoose.connection.db.dropDatabase();
            await mongoose.connection.close();
            done();
        }, 500)
    });;
});


//manar
describe('testing stories 3, 4, and 18', () => {
    // documents to perform tests on   
    let adm1, par1, eve1;
    beforeAll(async (done) => {
        await mongoose.connect(config.getTestingDbConnectionString(), { useNewUrlParser: true, useCreateIndex: true });
        adm1 = new Admin({ username: 'TesterAdmin', password: '1234568910', email: 'commentTesterAdmin@a.com' });
        par1 = new Partner({ username: 'TesterPartner', name: 'Tester', password: '12345678910', email: 'commentTesterPartner@a.com' });
        await adm1.save();
        await par1.save();
        done();
    });
    afterAll((done) => {
        setTimeout(async () => {
            await mongoose.connection.db.dropDatabase();
            await mongoose.connection.close();
            done();
        }, 500)
       
    });
    test(`Creating an event should return a message if it was done for a partner successfully`, async (done) => {
        var res = await funcs.CreatingAnEventForPartner(par1);
        expect(res).toMatch("created event for partner successfully");
        done();
    })

    test(`Creating an event should return a message if it was done for a admin successfully`, async (done) => {
        var res = await funcs.CreatingAnEventForAdmin(adm1);
        expect(res).toMatch("created event for admin successfully");
        done();
    })

    test(`Pending events should return an array of event objects`, async (done) => {
        var res = await funcs.GetPendingEventsForAdmin();
        expect(res.data[0].eventStatus).toMatch('Submitted');
        done();
    })
});

//ibrahim
describe('testing stories 7, 16, 12 and 22', () => {
    // documents to perform tests on   
    let mem1, adm1, par1, vac1, vac2, eve1;
    beforeAll(async (done) => {
        await mongoose.connect(config.getTestingDbConnectionString(), { useNewUrlParser: true, useCreateIndex: true }).then(() => console.log('connected successfully')).catch(err => console.log('got error' + err));

        mem1 = new Member({ username: 'TesterMember', password: '176351', fname: 'john', lname: 'doe', email: 'memtest@m.com', address: '23 IdiotTest St testCity', interests: ['lego', 'programming'] });
        adm1 = new Admin({ username: 'TesterAdmin', password: '1234568910', email: 'commentTesterAdmin@a.com' });
        par1 = new Partner({ username: 'TesterPartner', name: 'Tester', password: '12345678910', email: 'commentTesterPartner@a.com' });
        vac1 = new Vacancy({ name: 'vacancyMadeToTest', status: 'Open', description: 'testingParty', duration: '7 years', city: 'testCity', partner: par1._id, admin: adm1._id });
        vac2 = new Vacancy({ name: 'vacancy2MadeToTest', status: 'Open', description: 'testingParty2', duration: '7 years', city: 'Paris', partner: par1._id });
        eve1 = new Event({ name: 'eventMadeToTest', eventStatus: 'Approved', description: 'testingParty', duration: '7 years', eventType: 'lego', partner: par1._id })
        par1.vacancies.push(vac1._id);
        await mem1.save();
        await adm1.save();
        await vac1.save();
        await vac2.save();
        await par1.save();
        await eve1.save();
        done();
    });
    afterAll((done) => {
        setTimeout(async () => {
            await mongoose.connection.db.dropDatabase();
            await mongoose.connection.close();
            done();
        }, 500)
    });
    test('expecting 2 comments added to a vacancy', async (done) => {
        let noOfComments = await funcs.AddingTwoCommentsToVacancy(vac1, par1, adm1);
        expect(noOfComments).toBe(2);
        done();
    });
    test('expecting vacancy applicants to increment by 1', async (done) => {
        let noOfApplicants = await funcs.gettingApplicants(vac1, par1, mem1);
        expect(noOfApplicants).toBe(1);
        done();
    });
    test('expecting returned profile to have same id of created one', async (done) => {
        let isSame = await funcs.showingProfile(mem1, par1);
        expect(isSame).toBeTruthy();
        done();
    });
    test('expecting one vacancy to be recommended', async (done) => {
        let noOfVacancies = await funcs.recommendVacancies(mem1);
        expect(noOfVacancies).toBe(1);
        done();
    });
    test('expecting one event to be recommended', async (done) => {
        let noOfEvents = await funcs.recommendEvents(mem1);
        expect(noOfEvents).toBe(1);
        done();
    })
});

//Israa
describe('testing user stories 23,24,25', () => {

    let vac1, vac2, adm1;
    beforeAll(async (done) => {
        await mongoose.connect(config.getTestingDbConnectionString(), { useNewUrlParser: true, useCreateIndex: true });
        par1 = new Partner({ username: 'TesterPartner', name: 'Tester', password: '12345678910', email: 'commentTesterPartner@a.com' });
        adm1 = new Admin({ username: 'adminMadeTotest', password: 'blahblah', fname: 'Adminfirst', lname: 'Adminlast', email: '123Admin@gmail.com' });
        vac1 = new Vacancy({ name: 'vacancyMadeToTest', status: 'Submitted', description: 'testingParty', duration: '7 years', partner: par1._id });
        vac2 = new Vacancy({ name: 'vacancyMadeToTest2', status: 'Open', description: 'testinggggg', duration: '10 years', partner: par1._id });

        await vac1.save();
        await adm1.save();
        await vac2.save();
        await par1.save();
        done();
    });
    afterAll((done) => {
        setTimeout(async () => {
            await mongoose.connection.db.dropDatabase();
            await mongoose.connection.close();
            done();
        }, 500)
    });
    test('changing a status of a vacancy by an admin', async (done) => {
        let response = await funcs.ChangeVacStatusAdmin(vac1);
        expect(response).toBeTruthy();
        done();
    });

    test('changing a status of a vacancy by a partner', async (done) => {
        let response1 = await funcs.ChangeVacStatusPartner(vac2);
        expect(response1).toBeTruthy();
        done();
    });

    test('changing name of admin', async (done) => {
        let response2 = await funcs.ChangeAdminName(adm1);
        expect(response2).toMatch('Updated');
        done();
    });

    test('changing password of admin', async (done) => {
        let response3 = await funcs.ChangeAdminPassword(adm1);
        expect(response3).toMatch('Updated');
        done();
    });

})
// // Mohamed Sabry
describe('testing 21.1 21.2', () => {
     // documents to perform tests on   
    let mem1, adm1,par1,eve1,vac1;
    beforeAll(async (done) => {
        await mongoose.connect(config.getTestingDbConnectionString(), { useNewUrlParser: true, useCreateIndex: true });
        mem1 = new Member({ username: 'TesterMember', password: '176351', fname: 'john', lname: 'doe', email: 'memtest@m.com', address: '23 IdiotTest St testCity', interests:['lego', 'programming'], membershipExpiryDate: "2005-10-31T22:00:00.000+00:00" });
        adm1 = new Admin({ username: 'TesterAdmin', password: '1234568910', email: 'commentTesterAdmin@a.com' });
        par1 = new Partner({ username: 'testPartner', name: 'Testing', password: '12345', email: 'passwordTesterPartner@a.com' });

        vac1 = new Vacancy({ name: 'vacancy2MadeToTest', status: 'Open', description: 'testingParty2', duration: '7 years', city: 'Paris', partner: par1._id });
        eve1 = new Event({ name: 'eventMadeToTest', eventStatus: 'Approved', description: 'testingParty', duration: '7 years', eventType: 'lego', partner: par1._id })
                     
        await mem1.save();
        await adm1.save();
        await par1.save();
        
        await vac1.save();
        await eve1.save();
        
        done();
    });
    afterAll(async (done) => {
        setTimeout(async () => {
            await mongoose.connection.db.dropDatabase();
            await mongoose.connection.close();
            done();
        }, 500)
           
    });
    
    test('update prof', async (done) => {
        let feed = await funcs.updateUser(mem1);
        expect(feed).toBe(false);
        done();
    });
    test('update prof admin', async (done) => {
        let feed = await funcs.updateUserAdmin(mem1,adm1);
        expect(feed).toBe(false);
        done();
    });
       
        test('view vacancy post', async (done) => {
        let feed = await funcs.viewVacancyPost(vac1);
        expect(feed).toBe(true);
        done();
    });
    test('view event post', async (done) => {
        let feed = await funcs.viewEventPost(eve1);
        expect(feed).toBe(true);
        done();
    });
    
}) 

describe('testing stories 1,2,19,20', () => {
    // documents to perform tests on   
    let mem1, adm1, par1, vac1, vac2, eve1;
    beforeAll(async (done) => {
        await mongoose.connect(config.getTestingDbConnectionString(), { useNewUrlParser: true, useCreateIndex: true });

        mem1 = new Member({ username: 'TesterMember', password: '176351', fname: 'john', lname: 'doe', email: 'memtest@m.com', address: '23 IdiotTest St testCity', interests: ['lego', 'programming'] });
        adm1 = new Admin({ username: 'TesterAdmin', password: '1234568910', email: 'commentTesterAdmin@a.com' });
        par1 = new Partner({ username: 'TesterPartner', name: 'Tester', password: '12345678910', email: 'commentTesterPartner@a.com' });
        vac1 = new Vacancy({ name: 'vacancyMadeToTest', status: 'Submitted', description: 'testingParty', duration: '7 years', city: 'testCity', partner: par1._id, admin: adm1._id });
        vac2 = new Vacancy({ name: 'vacancy2MadeToTest', status: 'Submitted', description: 'testingParty2', duration: '7 years', city: 'Paris', partner: par1._id });
        eve1 = new Event({ name: 'eventMadeToTest', eventStatus: 'Submitted', description: 'testingParty', duration: '7 years', eventType: 'lego', partner: par1._id })
        par1.events.push(eve1._id);
        par1.vacancies.push(vac1._id);
        await mem1.save();
        await adm1.save();
        await vac1.save();
        await vac2.save();
        await par1.save();
        await eve1.save();
        done();
    });
    afterAll(async (done) => {
        setTimeout(async () => {
            await mongoose.connection.db.dropDatabase();
            await mongoose.connection.close();
            done();
        }, 500)
    });
    test(`Creating a Partner should return a message if it was done successfully`, async (done) => {
        var res = await funcs.createPartner();
        expect(res).toMatch("Added a partner");
        done();
    })

    test(`Creating a member should return a message if it was done successfully`, async (done) => {
        var res = await funcs.createMember();
        expect(res).toMatch("Added a member");
        done();
    })

    test(`Pending events for partner should return an array of event objects`, async (done) => {
        var res = await funcs.GetPendingEventsForPartner(par1);
        expect(res.length).toBeGreaterThan(0);
        done();
    })

    test(`Pending vacancies for partner should return an array of Vacancy objects`, async (done) => {
        var res = await funcs.GetPendingVacanciesForPartner(par1);
        expect(res.length).toBeGreaterThan(0);
        done();
    })

});

// Nada
describe('TESTING NADA', () => {
    let  adm1, par1, eve1;
    beforeAll(async (done) => {
    await mongoose.connect(config.getTestingDbConnectionString(), { useNewUrlParser: true, useCreateIndex: true });
        adm1 = new Admin({ username: 'TesterAdmin', password: '1234568910', email: 'commentTesterAdmin@a.com' });
        par1 = new Partner({ username: 'TesterPartner', name: 'Tester', password: '12345678910', email: 'commentTesterPartner@a.com' });
        eve1 = new Event({ name: 'event2MadeToTest', status: 'Submitted', description: 'testingParty3', price: 300, city: 'Paris', partner: par1._id, admin:adm1._id });
        par1.events.push(eve1._id);
        await adm1.save();
        await par1.save();
        await eve1.save();
        done();
    });
    afterAll((done) => {
        setTimeout(async () => {
            await mongoose.connection.db.dropDatabase();
            await mongoose.connection.close();
                done();
            }, 500)
    });
    test('expecting 2 comments added to an event', async (done) => {
        let noOfComments = await funcs.AddingTwoCommentsToEvents(eve1, par1, adm1);
        expect(noOfComments).toBe(2);
        done();
    });
    test('expecting creating a vacancy', async (done) => {
        let number = await funcs.CreatingVacancy(par1)
        expect(number).toBe(1);
        done();
    });
});

// // Abdelrahman
describe('Testing Abdelrahman stories', () => {
      
    let adm1, par1, vac1;
    beforeAll(async (done) => {
        await mongoose.connect(config.getTestingDbConnectionString(), { useNewUrlParser: true, useCreateIndex: true });
            
        adm1 = new Admin({ username: 'TesterAdmin', password: '1234568910', email: 'commentTesterAdmin@a.com' });
        par1 = new Partner({ username: 'TesterPartner', name: 'Tester', password: '12345678910', email: 'commentTesterPartner@a.com' });
        vac1 = new Vacancy({ name: 'vacancyMadeToTest', status: 'Open', description: 'testingParty', duration: '7 years', city: 'testCity',partner: par1._id, admin: adm1._id });
        par1.vacancies.push(vac1._id);
        await adm1.save();
        await vac1.save();
        await par1.save();
        done();
    });
    afterAll((done) => {
        setTimeout(async () => {
            await mongoose.connection.db.dropDatabase();
            await mongoose.connection.close();
                done();
            }, 500)
    });
    
    test('expecting the deletion of an vacancy', async (done) =>{
        let deletion = await funcs.DeletePendingVacancyReq(vac1, par1);
        expect(deletion.data.length).toBe(0);
        done();
    
    });
    test('viewing pending vacancies as admin', async (done) =>{
        let viewing = await funcs.ViewingPendingVacancies(adm1);
        expect(viewing.data.length).toBe(0);
        done();
    });    
});

describe('testing stories 13, 14 and 22', () => {
    // documents to perform tests on   
    let mem1, adm1, par1, vac1, vac2;
    beforeAll(async (done) => {
        await mongoose.connect(config.getTestingDbConnectionString(), { useNewUrlParser: true, useCreateIndex: true });
        
        mem1 = new Member({ username: 'TesterMember1', password: '176351', fname: 'john', lname: 'doe', email: 'memtest@m.com', address: '23 IdiotTest St testCity' });
        adm1 = new Admin({ username: 'TesterAdmin', password: '1234568910', email: 'commentTesterAdmin@a.com' });
        par1 = new Partner({ username: 'TesterPartner', name: 'Tester', password: '12345678910', email: 'commentTesterPartner@a.com', notifications: [{srcURL: 'String',description: 'String1'},{srcURL: 'Stringnotif2',description: 'String1notif2'}]});
        vac1 = new Vacancy({ name: 'vacancyMadeToTest', status: 'Submitted', description: 'testingParty', duration: '7 years', city: 'testCity',partner: par1._id, admin: adm1._id });
        vac2 = new Vacancy({ name: 'vacancy2MadeToTest', status: 'Open', description: 'testingParty2', duration: '7 years', city: 'Paris', partner: par1._id });
        par1.vacancies.push(vac1._id);
        eve = new Event({name:'event', description: 'cool event', price: 100, city: 'cairo', location: 'west el balad', eventStatus: 'Approved'});
        eve.partner = par1._id;
        par1.events.push(eve._id);
        await mem1.save();
        await adm1.save();
        await vac1.save();
        await vac2.save();
        await par1.save();
        await eve.save();
        done();
    });
    afterAll((done) => {
        setTimeout(async () => {
            await mongoose.connection.db.dropDatabase();
            await mongoose.connection.close();
            done();
        }, 500)
        
    });
    test('expecting notifications to be showed all (story 13)', async (done) => {
        let notification = await funcs.getnotifications(par1);
        expect(notification.data[0].seen).toBe(true);
        done();
    });

    test('expecting anyone get approved events (story 14)', async (done) => {
        let appevents = await funcs.getappevents();
        expect(appevents.data[0].eventStatus).toMatch('Approved');
        done();
    });

    test('expecting update vacancy as a partner (story 22)', async (done) => {
      
        let updatevac = await funcs.updatevac(vac1);
        expect(updatevac.data.duration).not.toMatch(vac1.duration);
        done();
    });
    
})