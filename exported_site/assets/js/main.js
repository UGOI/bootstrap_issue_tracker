// Initialise server
const serverUrl = 'https://hb8ozxaq1hib.usemoralis.com:2053/server'
const appId = 'fcZFvcJa1HnDajxbozY09XDIv2MqaJ8FB4kd4aAm'

Moralis.start(
  {
    serverUrl,
    appId
  })


// choose_account_type
if (document.getElementById('continue_with_account_type_button')) {
  document.getElementById('continue_with_account_type_button').onclick = function () {
    redirectToChosenSignUpPage()
  }
};
if (document.getElementById('i_am_project_member_button')) {
  document.getElementById('i_am_project_member_button').onclick = function () {
    saveLastClickedButton('project_member_button')
  }
};
if (document.getElementById('i_am_sponsor_button')) {
  document.getElementById('i_am_sponsor_button').onclick = function () {
    saveLastClickedButton('sponsor_button')
  }
};

// Sign In/Up
if (document.getElementById('metamask_button')) {
  document.getElementById('metamask_button').onclick = function () {
    metamaskLogin()
  }
};
if (document.getElementById('project_member_sign_up_button')) {
  document.getElementById('project_member_sign_up_button').onclick = function () {
    userSignUp()
  }
};
if (document.getElementById('form_sign_in_button')) {
  document.getElementById('form_sign_in_button').onclick = function () {
    userSignIn()
  }
};
if (document.getElementById('navbar_sign_in_button')) {
  document.getElementById('navbar_sign_in_button').onclick = function () {
    window.location.href = 'sign_in.html'
  }
};
if (document.getElementById('navbar_sign_up_button')) {
  document.getElementById('navbar_sign_up_button').onclick = function () {
    window.location.href = 'choose_account_type.html'
  }
};
if (document.getElementById('logout_button')) {
  document.getElementById('logout_button').onclick = function () {
    logout()
  }
};

// create things
if (document.getElementById('create_project_button')) {
  document.getElementById('create_project_button').onclick = function () {
    createProject()
  }
};

window.onload = function () {
  loadNavBar()
  renderProjects()
}


// Authentification

async function metamaskLogin () {
  let currentUser
  try {
    currentUser = Moralis.User.current()
    if (!currentUser) {
      currentUser = await Moralis.authenticate()
      redirectLoggedInUser()
      loadNavBar()
    } else {
      redirectLoggedInUser()
    }
  } catch (error) {
    console.log(error)
  }
}

async function logout () {
  await Moralis.User.logOut()
  redirectLoggedOutUser()
  loadNavBar()
}

async function userSignUp () {
  // Get the user credential
  const _username = document.getElementById('email').value
  const _password = document.getElementById('password').value

  // Create a new user and set username and password attributes
  const user = new Moralis.User()
  user.set('username', _username)
  user.set('password', _password)

  // Sign them up with one line of code
  try {
    await user.signUp()
  } catch (error) {
    console.log('Error: ' + error.code + ' ' + error.message)
  }
  redirectLoggedInUser()
  loadNavBar()
}

async function userSignIn () {
  const user = Moralis.User.current()
  if (!user) {
    const _username = document.getElementById('email').value
    const _password = document.getElementById('password').value

    // Log them in with one line of code
    try {
      await Moralis.User.logIn(_username, _password)
      redirectLoggedInUser()
    } catch (error) {
      console.log('Error: ' + error.code + ' ' + error.message)
    }
  } else customAlert('A user is already logged in')

  loadNavBar()
}

function saveLastClickedButton (clickedId) {
  globalThis.lastClickedButton = clickedId
}

function customAlert (message) {
  // eslint-disable-next-line no-undef
  alert(message)
}

function redirectToChosenSignUpPage () {
  if (globalThis.lastClickedButton === 'project_member_button') {
    window.location.href = 'project_member_sign_up.html'
  } else if (globalThis.lastClickedButton === 'sponsor_button') {
    window.location.href = 'sponsor_sign_up.html'
  } else {
    customAlert('Please select project member or sponsor')
  }
}

async function renderProjects () {
const lastSegment = window.location.href.split("/").pop()
if(lastSegment == 'index.html' || lastSegment == ''){
  const projectSection = document.getElementById('project_section')
  projectSection.innerText = ''
  let result

  try {
    const query = new Moralis.Query('Project')
    query.descending('createdAt')
    // query.equalTo("projectName", 'TestProject');
    result = await query.find()
    // console.log(result)
  } catch (error) {
    projectSection.innerHTML = `
                    <p>No comments, you may not have permission to view them</p>
                    `
    return
  }
  if (result) {
    let rolesByProjectId
    rolesByProjectId = await Moralis.Cloud.run('getUserRoleInProject')
    rolesByProjectId = JSON.parse(rolesByProjectId)

    for (let i = 0; i < result.length; i++) {
      const role = rolesByProjectId[result[i].id].split("-")[1]
      // .split('-').pop();

      // console.log(result[i].id)
      const content = document.createElement('li')
      content.className = 'list-group-item'

      content.innerHTML = `

<div class="d-flex align-items-lg-center">
    <div class="d-sm-flex justify-content-sm-center align-items-sm-center project_avatar"><a class="text-decoration-none project_avatar_link" href="/TestProject/"><span>T</span></a></div>
    <div class="d-flex flex-grow-1">
        <h2 class="project_full_title"><a class="text-decoration-none" href="project.html#${result[i].id}"><span><span>Example Path/</span><span>${result[i].get('projectName')}</span></span></a></h2><img class="align-items-md-center lock_icon" src="lock.svg" />
        <div class="d-md-flex align-items-md-center"><span class="project-role-label">${role}</span></div>
    </div>
    <div class="justify-content-lg-end">
        <div class="d-lg-flex justify-content-lg-end align-items-lg-center"><img class="starfish-icon" src="starfish.svg" /><a class="text-decoration-none text-muted" href="#">0</a></div>
        <div><span style="font-size: 13px;">Updated<time class="timeago" datetime="2008-07-17T09:24:17Z"> ${timeSince(result[i].get('updatedAt'))} ago.</time></span></div>
    </div>
</div>
                            `

      projectSection.appendChild(content)
    }
  }
}
}

async function createNewRole (_name) {
  const params = { name: _name }
  await Moralis.Cloud.run('createNewRole', params)
}

// You can call this function to create a new role
async function addUsersToRole (_name) {
  const params = { name: _name }

  await Moralis.Cloud.run('addUsersToRole', params)
}

async function createProject () {
  const Project = Moralis.Object.extend('Project')
  const newProject = new Project()

  const projectCreator = Moralis.User.current()
  const projectTitle = document.getElementById('project_name_input').value
  if (projectTitle === '') { return console.log('ERROR: empty title') }

  newProject.set('projectName', projectTitle)
  newProject.set('creator', projectCreator)
  newProject.set('owner', projectCreator)
  newProject.set('members', projectCreator)

  await newProject.save()

  const roleName = newProject.id + '-Owner'
  createNewRole(roleName)

  const postACL = new Moralis.ACL()
  postACL.setRoleWriteAccess(roleName, true)
  postACL.setRoleReadAccess(roleName, true)
  newProject.setACL(postACL)

  await newProject.save()

  addUsersToRole(roleName)

  window.location.href = 'index.html'
}

// Check the user status and show/hide content depending on if they are logged in or not
function loadNavBar () {
  const currentUser = Moralis.User.current()
  if (document.getElementById('navbar_logged_in')) {
    if (currentUser) {
      document.getElementById('navbar_logged_out').style.display = 'none'
      document.getElementById('navbar_logged_in').style.display = 'block'
      console.log('LoggedIn check')
    } else {
      document.getElementById('navbar_logged_in').style.display = 'none'
      document.getElementById('navbar_logged_out').style.display = 'block'
      console.log('LoggedOut check')
    }
  }
}

function redirectLoggedInUser () {
  try {
    const currentUser = Moralis.User.current()
    if (currentUser) {
      window.location.href = 'index.html'
      loadNavBar()
    }
  } catch (error) {
    console.log(error)
  }
}

function redirectLoggedOutUser () {
  try {
    const currentUser = Moralis.User.current()
    if (!currentUser) {
      window.location.href = 'index.html'
      loadNavBar()
    }
  } catch (error) {
    console.log(error)
  }
}

function timeSince(datestring) {
    
  formattedDate = datestring.toISOString().split(".")[0]
  date = new Date(formattedDate)
    
    
    
  const seconds = Math.floor((new Date() - date) / 1000)

  let interval = seconds / 31536000

  if (interval > 1) {
    return Math.floor(interval) + ' years'
  }
  interval = seconds / 2592000
  if (interval > 1) {
    return Math.floor(interval) + ' months'
  }
  interval = seconds / 86400
  if (interval > 1) {
    return Math.floor(interval) + ' days'
  }
  interval = seconds / 3600
  if (interval > 1) {
    return Math.floor(interval) + ' hours'
  }
  interval = seconds / 60
  if (interval > 1) {
    return Math.floor(interval) + ' minutes'
  }
  return Math.floor(seconds) + ' seconds'
}
