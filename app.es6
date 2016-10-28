"use strict"
const baseURL = "https://sweltering-torch-2616.firebaseIO.com/"
const year = 2016
const weeks = [
  [27, 28, 29, 30, 1, 2, 3],
  [4, 5, 6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15, 16, 17],
  [18, 19, 20, 21, 22, 23, 24],
  [25, 26, 27, 28, 29, 30, 31]
]

/**
 * Setup firebase sync
 */
const username = localStorage.getItem("username")
const profileImageURL = localStorage.getItem("profileImageURL")
const Articles = new Firebase(`${baseURL}${year}/articles`)

/**
 * Create Vue app
 */

const App = new Vue({

  el: "#app",

  data: {
    loading: true,
    articles: [],
    weeks: weeks.map(week => week.map(day => ({ day: day, editing: false }))),
    newArticle: {
      username: username,
      profileImageURL: profileImageURL,
      day: 0,
      url: "",
      title: ""
    }
  },

  computed: {
    validation() {
      return {
        title: !!this.newArticle.title.trim()
      }
    },
    isValid() {
      const validation = this.validation
      return Object.keys(validation).every((key) => validation[key])
    }
  },

  methods: {
    addArticle() {
      if (this.isValid) {
        Articles.push(this.newArticle)
        $("#newArticle").modal("hide")
        this.newArticle.day = 0
        this.newArticle.url = ""
        this.newArticle.title = ""
      }
    },
    getArticle(day) {
      return this.articles.find((article) => article.day === day.day)
    },
    isEnabled(day) {
      return day.day < 26 && !this.getArticle(day)
    },
    isEditabled(day) {
      const article = this.getArticle(day)
      return article && this.newArticle.username === article.username
    },
    setDay(day) {
      this.newArticle.day = day.day
    },
    editMode(day) {
      day.editing = true
    },
    editArticle(day) {
      const article = this.getArticle(day)
      new Firebase(`${baseURL}${year}/articles/${article.id}`)
        .update(article)
      this.loading = true
      day.editing = false
    },
    removeArticle(day) {
      const article = this.getArticle(day)
      new Firebase(`${baseURL}${year}/articles/${article.id}`).remove()
      this.loading = true
    },
    login() {
      const ref = new Firebase(baseURL)
      ref.authWithOAuthPopup("github", (error, authData) => {
        if (!error) {
          localStorage.setItem("username", authData.github.username)
          localStorage.setItem("profileImageURL", authData.github.profileImageURL)
          this.loading = false
          this.newArticle.username = authData.github.username
          this.newArticle.profileImageURL = authData.github.profileImageURL
        }
      })
    },
    logout: function () {
      localStorage.setItem("username", "")
      localStorage.setItem("profileImageURL", "")
      location.reload(true)
    }
  }
})

Articles.on("child_added", (snapshot) => {
  const item = snapshot.val()
  item.id = snapshot.key()
  App.articles.push(item)
  App.loading = false
})

Articles.on("child_removed", (snapshot) => {
  const id = snapshot.key()
  App.articles.some((article) => {
    if (article.id === id) {
      App.articles.$remove(article)
      App.loading = false
      return true
    }
  })
})

$("[data-toggle=\"tooltip\"]").tooltip()
