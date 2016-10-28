"use strict";

var baseURL = "https://sweltering-torch-2616.firebaseIO.com/";
var year = 2016;
var weeks = [[27, 28, 29, 30, 1, 2, 3], [4, 5, 6, 7, 8, 9, 10], [11, 12, 13, 14, 15, 16, 17], [18, 19, 20, 21, 22, 23, 24], [25, 26, 27, 28, 29, 30, 31]];

/**
 * Setup firebase sync
 */
var username = localStorage.getItem("username");
var profileImageURL = localStorage.getItem("profileImageURL");
var Articles = new Firebase("" + baseURL + year + "/articles");

/**
 * Create Vue app
 */

var App = new Vue({

  el: "#app",

  data: {
    loading: true,
    articles: [],
    weeks: weeks.map(function (week) {
      return week.map(function (day) {
        return { day: day, editing: false };
      });
    }),
    newArticle: {
      username: username,
      profileImageURL: profileImageURL,
      day: 0,
      url: "",
      title: ""
    }
  },

  computed: {
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
    getArticle: function getArticle(day) {
      return this.articles.find(function (article) {
        return article.day === day.day;
      });
    },
    isEnabled: function isEnabled(day) {
      return day.day < 26 && !this.getArticle(day);
    },
    isEditabled: function isEditabled(day) {
      var article = this.getArticle(day);
      return article && this.newArticle.username === article.username;
    },
    setDay: function setDay(day) {
      this.newArticle.day = day.day;
    },
    editMode: function editMode(day) {
      day.editing = true;
    },
    editArticle: function editArticle(day) {
      var article = this.getArticle(day);
      new Firebase("" + baseURL + year + "/articles/" + article.id).update(article);
      this.loading = true;
      day.editing = false;
    },
    removeArticle: function removeArticle(day) {
      var article = this.getArticle(day);
      new Firebase("" + baseURL + year + "/articles/" + article.id).remove();
      this.loading = true;
    },
    login: function login() {
      var _this = this;

      var ref = new Firebase(baseURL);
      ref.authWithOAuthPopup("github", function (error, authData) {
        if (!error) {
          localStorage.setItem("username", authData.github.username);
          localStorage.setItem("profileImageURL", authData.github.profileImageURL);
          _this.loading = false;
          _this.newArticle.username = authData.github.username;
          _this.newArticle.profileImageURL = authData.github.profileImageURL;
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

Articles.on("child_added", function (snapshot) {
  var item = snapshot.val();
  item.id = snapshot.key();
  App.articles.push(item);
  App.loading = false;
});

Articles.on("child_removed", function (snapshot) {
  var id = snapshot.key();
  App.articles.some(function (article) {
    if (article.id === id) {
      App.articles.$remove(article);
      App.loading = false;
      return true;
    }
  });
});

$("[data-toggle=\"tooltip\"]").tooltip();
