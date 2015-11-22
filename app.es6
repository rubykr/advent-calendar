"use strict"
const baseURL = "https://sweltering-torch-2616.firebaseIO.com/"
const year = 2015
const weeks = [
  [29, 30, 1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10, 11, 12],
  [13, 14, 15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24, 25, 26]
]

/**
 * Setup firebase sync
 */
const username = localStorage.getItem("username")
const profileImageURL = localStorage.getItem("profileImageURL")


const Articles = new Firebase(baseURL + year + "/articles")

Articles.on("child_added", (snapshot) => {
  const item = snapshot.val()
  item.id = snapshot.key()
  app.articles.push(item)
  app.loading = false
})

Articles.on("child_removed", (snapshot) => {
  const id = snapshot.key()
  app.articles.some((article) => {
    if (article.id === id) {
      app.articles.$remove(article)
      return true
    }
  })
})

/**
 * Create Vue app
 */

const app = new Vue({

  el: "#app",

  data: {
    loading: true,
    articles: [],
    newArticle: {
      username: username,
      profileImageURL: profileImageURL,
      day: 0,
      url: "",
      title: ""
    }
  },

  computed: {
    weeks: function () {
      const returns = []
      for (let i = 0, l = weeks.length; i < l; i++) {
        const week = weeks[i]
        const weekData = []
        for (let k = 0, m = week.length; k < m; k++) {
          const day = week[k]
          const article = this.articles.find((article) => article.day === day)
          const enabled = (day < 26 && !article)
          const editabled = article && this.newArticle.username === article.username
          weekData.push({
            day: day,
            article: article,
            enabled: enabled,
            editabled: editabled,
            editing: false
          })
        }
        returns.push(weekData)
      }
      return returns
    },
    validation: function () {
      return {
        title: !!this.newArticle.title.trim()
      }
    },
    isValid: function () {
      const validation = this.validation
      return Object.keys(validation).every((key) => validation[key])
    }
  },

  methods: {
    addArticle: function () {
      if (this.isValid) {
        Articles.push(this.newArticle)
        $("#newArticle").modal("hide")
        this.newArticle.day = 0
        this.newArticle.url = ""
        this.newArticle.title = ""
      }
    },
    editArticle: function (day) {
      new Firebase(baseURL + year + "/articles/" + day.article.id).update(day.article)
      this.loading = true
      day.editing = false
    },
    removeArticle: function (id) {
      new Firebase(baseURL + year + "/articles/" + id).remove()
    },
    login: function () {
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
$("[data-toggle=\"tooltip\"]").tooltip()
