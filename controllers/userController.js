const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = 'de317f1c8cd5c62'
const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  getProfile: (req, res) => {
    return User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [Restaurant] }
      ]
    }).then(profile => {
      console.log(profile.Restaurant)
    })
  },

  editProfile: (req, res) => {
    return User.findByPk(req.params.id).then(user => {
      return res.render('create', { user: user })
    })
  },

  putProfile: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: req.body.name,
              email: req.body.email,
              image: file ? img.data.link : user.image,
            }).then((user) => {
              req.flash('success_messages', 'user was successfully to update')
              res.redirect('/profile/:id')
            })
          })
      })
    } else {
      return User.findByPk(req.params.id)
        .then((user) => {
          user.update({
            name: req.body.name,
            email: req.body.email,
            image: user.image,
          }).then((user) => {
            req.flash('success_messages', 'user was successfully to update')
            res.redirect('/profile/:id')
          })
        })
    }
  },

}

module.exports = userController