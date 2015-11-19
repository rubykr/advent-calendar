var baseURL = 'https://sweltering-torch-2616.firebaseIO.com/'
var year = 2015
var project = 'ruby-korea'

/**
 * Setup firebase sync
 */

var Articles = new Firebase(baseURL + year + '/articles')
localStorage.setItem("username", "marocchino")
var username = localStorage.getItem("username")

Articles.on('child_added', function (snapshot) {
  var item = snapshot.val()
  item.id = snapshot.key()
  app.articles.push(item)
  app.loading = false
})

Articles.on('child_removed', function (snapshot) {
  var id = snapshot.key()
  app.articles.some(function (article) {
    if (article.id === id) {
      app.articles.$remove(article)
      return true
    }
  })
})

/**
 * Create Vue app
 */

var app = new Vue({

  // element to mount to
  el: '#app',

  // initial data
  data: {
    loading: false,
    // loading: true,
    articles: [],
    newArticle: {
      username: username,
      day: 0,
      url: '',
      title: ''
    }
  },

  // computed property for form validation state
  computed: {
    weeks: function () {
      var returns = []
      const weeks = [
        [29, 30, 1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10, 11, 12],
        [13, 14, 15, 16, 17, 18, 19],
        [20, 21, 22, 23, 24, 25, 26],
      ]
      for (var i = 0, l = weeks.length; i < l; i++) {
        var week = weeks[i]
        var weekData = []
        var that = this
        for (var k = 0, m = week.length; k < m; k++) {
          var day = week[k]
          var article = this.articles.find(function (article){
            return article.day === day
          })
          var enabled = (day < 26 && !article)
          var editabled = article && that.newArticle.username === article.username
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
      var validation = this.validation
      return Object.keys(validation).every(function (key) {
        return validation[key]
      })
    }
  },

  // methods
  methods: {
    addArticle: function () {
      if (this.isValid) {
        Articles.push(this.newArticle)
        this.newArticle.day = 0
        this.newArticle.url = ''
        this.newArticle.title = ''
      }
    },
    editArticle: function (day) {
      new Firebase(baseURL + year + '/articles/' + day.article.id).update(day.article)
      this.loading = true
      day.editing = false
    },
    removeArticle: function (id) {
      new Firebase(baseURL + year + '/articles/' + id).remove()
    }
  }
})
