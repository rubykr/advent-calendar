"use strict";

var baseURL = "https://sweltering-torch-2616.firebaseIO.com/";
var year = 2015;
var _weeks = [[29, 30, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17, 18, 19], [20, 21, 22, 23, 24, 25, 26]];

/**
 * Setup firebase sync
 */
var username = localStorage.getItem("username");
var profileImageURL = localStorage.getItem("profileImageURL");

var Articles = new Firebase(baseURL + year + "/articles");

Articles.on("child_added", function (snapshot) {
  var item = snapshot.val();
  item.id = snapshot.key();
  app.articles.push(item);
  app.loading = false;
});

Articles.on("child_removed", function (snapshot) {
  var id = snapshot.key();
  app.articles.some(function (article) {
    if (article.id === id) {
      app.articles.$remove(article);
      return true;
    }
  });
});

/**
 * Create Vue app
 */

var app = new Vue({

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
    weeks: function weeks() {
      var _this = this;

      var returns = [];
      for (var i = 0, l = _weeks.length; i < l; i++) {
        var week = _weeks[i];
        var weekData = [];

        var _loop = function _loop(k, m) {
          var day = week[k];
          var article = _this.articles.find(function (article) {
            return article.day === day;
          });
          var enabled = day < 26 && !article;
          var editabled = article && _this.newArticle.username === article.username;
          weekData.push({
            day: day,
            article: article,
            enabled: enabled,
            editabled: editabled,
            editing: false
          });
        };

        for (var k = 0, m = week.length; k < m; k++) {
          _loop(k, m);
        }
        returns.push(weekData);
      }
      return returns;
    },
    validation: function validation() {
      return {
        title: !!this.newArticle.title.trim()
      };
    },
    isValid: function isValid() {
      var validation = this.validation;
      return Object.keys(validation).every(function (key) {
        return validation[key];
      });
    }
  },

  methods: {
    addArticle: function addArticle() {
      if (this.isValid) {
        Articles.push(this.newArticle);
        $("#newArticle").modal("hide");
        this.newArticle.day = 0;
        this.newArticle.url = "";
        this.newArticle.title = "";
      }
    },
    editArticle: function editArticle(day) {
      new Firebase(baseURL + year + "/articles/" + day.article.id).update(day.article);
      this.loading = true;
      day.editing = false;
    },
    removeArticle: function removeArticle(id) {
      new Firebase(baseURL + year + "/articles/" + id).remove();
    },
    login: function login() {
      var _this2 = this;

      var ref = new Firebase(baseURL);
      ref.authWithOAuthPopup("github", function (error, authData) {
        if (!error) {
          localStorage.setItem("username", authData.github.username);
          localStorage.setItem("profileImageURL", authData.github.profileImageURL);
          _this2.loading = false;
          _this2.newArticle.username = authData.github.username;
          _this2.newArticle.profileImageURL = authData.github.profileImageURL;
        }
      });
    },
    logout: function logout() {
      localStorage.setItem("username", "");
      localStorage.setItem("profileImageURL", "");
      location.reload(true);
    }
  }
});
$("[data-toggle=\"tooltip\"]").tooltip();
