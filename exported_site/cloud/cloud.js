Moralis.Cloud.define("getData", async (request) => {
    const query = new Moralis.Query("Note");
    query.descending("createdAt")
    const results = await query.find({sessionToken: request.user.get('sessionToken'), useMasterKey: true});
    console.log(request.user)
    return results
});


Moralis.Cloud.define("getProjectById", async (request) => {
    const query = new Moralis.Query("Project");
    query.equalTo("objectId", request.params.objectId);
    
    const results = await query.find({useMasterKey: true});
    return results[0]
});


Moralis.Cloud.define("createNewRole", async (request) => {

    //ACL
    let roleACL = new Moralis.ACL({ useMasterKey: true })
    roleACL.setPublicReadAccess(true,{ useMasterKey: true });
    roleACL.setPublicWriteAccess(false,{ useMasterKey: true });
    
    // Create role
    let newRole = new Moralis.Role(request.params.name, roleACL,{ useMasterKey: true });


    objectId = request.params.name.split("-")[0]
    const params = { objectId: objectId }
    let project = await Moralis.Cloud.run('getProjectById', params)


    newRole.set('project', project,{ useMasterKey: true })
    newRole.save(null, { useMasterKey: true });


});

Moralis.Cloud.define("addUsersToRole", async (request) => {


    let roleQuery = new Moralis.Query(Moralis.Role, { useMasterKey: true })
    roleQuery.equalTo("name", request.params.name, { useMasterKey: true })
    let result = await roleQuery.first({ useMasterKey: true })
    if(result){
        result.getUsers().add(request.user)
        result.save(null, { useMasterKey: true });
    }

});

Moralis.Cloud.define("getUserRoleInProject", async (request) => {

    var obj = new Object();

    const query = new Moralis.Query(Moralis.Role, {
        useMasterKey: true
    })

    // Retrieve the most recent ones
    query.descending("createdAt");

    // query.exists("project");

    let roles = await query.find({
        useMasterKey: true
    });

    for (let i = 0; i < roles.length; i++) {
        try {
        const role = roles[i];
        const usersQuery = role.get("users").query();
        const users = await usersQuery.find({
            useMasterKey: true
        });
        obj[role.attributes.project.id] = "None";

        for (let i = 0; i < users.length; i++) {

            if (users[i].id = request.user.id) {
                obj[role.attributes.project.id] = role.attributes.name;
            }
        }
    } catch(error){
        const logger = Moralis.Cloud.getLogger();
        logger.info(error);
    }

    }

    var jsonString = JSON.stringify(obj);

    return jsonString;




});