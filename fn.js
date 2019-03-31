const axios = require('axios');
const functions = {

    AddingTwoCommentsToVacancy: async (vac, par, adm) => {
        let updatedVac = "";
        try {
            await axios.post(`http://localhost:3000/api/vacancy/${vac._id}/comment`, {
                userType: "Admin",
                userId: adm._id,
                comment: "duration is long"
            });
            await axios.post(`http://localhost:3000/api/vacancy/${vac._id}/comment`, {
                userType: "Partner",
                userId: par._id,
                comment: "i know"
            });
            updatedVac = await axios.get(`http://localhost:3000/api/vacancy/Post/${vac._id}`);
            return (updatedVac.data.commentsByPartner.concat(updatedVac.data.commentsByAdmin).length);

        } catch (error) {
            console.log('GOT ERROR')
            console.log(error)
            return 'not';
        }

    },
    gettingApplicants: async (vac, par, mem) => {
        let applicantsRes;
        try {
            await axios.put(`http://localhost:3000/api/vacancy/${vac._id}/apply`, {
                userId: mem._id
            });
            applicantsRes = await axios.get(`http://localhost:3000/api/vacancy/${vac._id}/applicants`, { 'headers': { 'userId': `${par._id}` } });
            return applicantsRes.data.length;
        } catch (error) {
            console.log('GOT ERROR')
            console.log(error)
            return 'not';
        }
    },
    showingProfile: async (mem, profile) => {
        let returnedProfile;
        try {
            returnedProfile = await axios.get(`http://localhost:3000/api/profile/${profile._id}`, { 'headers': { 'userId': `${mem._id}`, 'userType': 'Member' } });
            return (returnedProfile.data._id == profile._id);

        } catch (error) {
            console.log('GOT ERROR')
            console.log(error)
            return 'not';
        }
    },
    recommendVacancies: async (mem) => {
        let recommendVacanciesRes;
        try {
            recommendVacanciesRes = await axios.get(`http://localhost:3000/api/vacancy/RecommendedVacancies`, { 'headers': { 'userId': `${mem._id}` } });
            return (recommendVacanciesRes.data.length);
        } catch (error) {
            console.log('GOT ERROR')
            console.log(error)
            return 'not';
        }
    },
    recommendEvents: async (mem) => {
        let recommendEventsRes;
        try {
            recommendEventsRes = await axios.get(`http://localhost:3000/api/event/RecommendedEvents`, { 'headers': { 'userId': `${mem._id}` } });
            console.log(recommendEventsRes.data);
            return (recommendEventsRes.data.length);
        } catch (error) {
            console.log('GOT ERROR')
            console.log(error)
            return 'not';
        }
    },

    updatePartnerProfileChangePassword: async (par1) => {
        const updated = await axios.put(`http://localhost:3000/api/profile/${par1._id}`, {
            userType: "Partner",
            userID: par1._id,
            password: "new_12345_password"
        });
        return updated.data.password;
    },

    updatePartnerProfileAddBoardMembers: async (par1) => {
        const updated = await axios.put(`http://localhost:3000/api/profile/${par1._id}`, {
            userType: "Partner",
            userID: par1._id,
            boardMembers: [{
                name: "ahdthsdjskztmed",
                email: "ahmedeeeenn@dfdgsaf"
            },
            {
                name: "mama",
                email: "mamaaaAfsdgg@rgsdh"
            },
            {
                name: "mido",
                email: "wdhssdhsd@erahaERHdfZHnf"
            }]
        });
        return updated.data.boardMembers.length;
    },

    updateEventByChangingRemainingPlaces: async (event1, par1) => {
        const updated = await axios.put(`http://localhost:3000/api/event/${event1._id}`, {
            userType: "Partner",
            userID: par1._id,
            remainingPlaces: 10
        });
        return updated.data.remainingPlaces;
    },

    CreatingAnEventForPartner: async (par) => {     
        var res;   
        try {
             res = await axios.post(`http://localhost:3000/api/event/${par._id}/CreateEvent`, {
                userType: "Partner",
                name:"eve",
                description: "idk",
                price: "567",
                location: "bla",
                eventDate: "2019-5-10",
                eventStatus: "Submitted",
                remainingPlaces: "3",
                eventType: "warever",
                speakers: "idkkk",
                topics: "nothing",
                partner:  par._id
            })
            return res
        } catch (error) {
            console.log('GOT ERROR')
            console.log(error)
            return 'not';
        }
    },

    CreatingAnEventForAdmin: async (adm) => {        
        try {
            var res = await axios.post(`http://localhost:3000/api/event/${adm._id}/CreateEvent`, {
                userType: "Admin",
                name:"eve1",
                description: "idk1",
                price: "567",
                location: "bla1",
                eventDate: "2019-5-10",
                eventStatus: "Submitted",
                remainingPlaces: "3",
                eventType: "warever1",
                speakers: "idkkk1",
                topics: "nothing1"
            })
            return res
        } catch (error) {
            console.log('GOT ERROR')
            console.log(error)
            return 'not';
        }
    },
    GetPendingEventsForAdmin: async()  => {        
        
            try {
                res =  await axios.get(`http://localhost:3000/api/event/PendingEventsAdmin`, {
                    userType: "Admin",
                    
                })
               
                return res
                
            } catch (error) {
                console.log('GOT ERROR')
                console.log(error)
                return 'not';
            }
            
         }
};

module.exports = functions;