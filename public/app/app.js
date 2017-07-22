angular.module('ViagensRESTWebsite', ['angular-storage', 'ui.router', 'weblogng'])
    //.constant('ENDPOINT_URI', 'http://localhost:3000/')
    .constant('ENDPOINT_URI', 'http://olamundos.herokuapp.com/')
    .config(function($stateProvider, $urlRouterProvider, $httpProvider) {
        $stateProvider
            .state('login', {
                url: '/utilizadores',
                templateUrl: 'app/templates/login.tmpl.html',
                controller: 'LoginCtrl',
                controllerAs: 'login'
            })
            .state('viagens', {
                url: '/viagens',
                templateUrl: 'app/templates/viagens.tmpl.html',
                controller: 'ViagensCtrl',
                controllerAs: 'viagens'
            })

        .state('momentos', {
            url: '/momentos',
            templateUrl: 'app/templates/momentos.tmpl.html',
            controller: 'MomentosCtrl',
            controllerAs: 'momentos'
        });

        $urlRouterProvider.otherwise('/viagens');
        $urlRouterProvider.otherwise('/momentos');
        $httpProvider.interceptors.push('APIInterceptor');
    })
    .service('APIInterceptor', function($rootScope, UserService) {
        var service = this
        service.request = function(config) {
            var currentUser = UserService.getCurrentUser(),
                access_token = currentUser ? currentUser.access_token : null;
            if (access_token) {
                config.headers.authorization = access_token;
            }
            return config;
        };
        service.responseError = function(response) {
            if (response.status === 401) {
                $rootScope.$broadcast('unauthorized');
            }
            return response;
        };
    })
    //utilizadores serviços  
    .service('UserService', function(store) {
        var service = this,
            currentUser = null;
        service.setCurrentUser = function(user) {
            currentUser = user;
            store.set('user', user);
            return currentUser;
        };
        service.getCurrentUser = function() {
            if (!currentUser) {
                currentUser = store.get('user');
            }
            return currentUser;
        };
    })
    .service('LoginService', function($http, ENDPOINT_URI) {
        var service = this,
            path = 'utilizadores/';

        function getUrl() {
            return ENDPOINT_URI + path;
        }

        function getLogUrl(action) {
            return getUrl() + action;
        }
        service.login = function(credentials) {
            return $http.post(getLogUrl('login'), credentials);
        };
        service.logout = function() {
            return $http.post(getLogUrl('logout'));
        };
        service.register = function(user) {
            return $http.post(getUrl(), user);
        };
    })
    //UTILIZADORES control
    .controller('LoginCtrl', function($rootScope, $state, LoginService, UserService) {
        var login = this;

        function signIn(user) {
            LoginService.login(user)
                .then(function(response) {
                    user.access_token = response.data.id;
                    UserService.setCurrentUser(user);
                    $rootScope.$broadcast('authorized');
                    $state.go('viagens');
                });
        }

        function register(user) {
            LoginService.register(user)
                .then(function(response) {
                    login(user);
                });
        }

        function submit(user) {
            login.newUser ? register(user) : signIn(user);
        }
        login.newUser = false;
        login.submit = submit;
    })
    .controller('MainCtrl', function($rootScope, $state, LoginService, UserService) {
        var main = this;

        function logout() {
            LoginService.logout()
                .then(function(response) {
                    main.currentUser = UserService.setCurrentUser(null);
                    $state.go('login');
                }, function(error) {
                    console.log(error);
                });
        }

        $rootScope.$on('authorized', function() {
            main.currentUser = UserService.getCurrentUser();
        });

        $rootScope.$on('unauthorized', function() {
            main.currentUser = UserService.setCurrentUser(null);
            $state.go('login');
        });

        main.logout = logout;
        main.currentUser = UserService.getCurrentUser();
    })
    //
    //Viagens serviço
    .service('ItemsModel', function($http, ENDPOINT_URI) {
        var service = this,
            path = 'viagens';

        function getUrl() {
            return ENDPOINT_URI + path;
        }

        function getUrlForId(itemId) {
            return getUrl(path) + itemId;
        }

        service.all = function() {
            return $http.get(getUrl());
        };

        service.fetch = function(itemId) {
            return $http.get(getUrlForId(itemId));
        };

        service.create = function(item) {
            return $http.post(getUrl(), item);
        };

        service.update = function(itemId, item) {
            return $http.put(getUrlForId(itemId), item);
        };

        service.destroy = function(itemId) {
            return $http.delete(getUrlForId(itemId));
        };
    })
    // viagens control
    .controller('ViagensCtrl', function(ItemsModel) {
        var viagens = this;

        function getItems() {
            ItemsModel.all()
                .then(function(result) {
                    viagens.items = result.data;
                });
        }

        function createItem(item) {
            ItemsModel.create(item)
                .then(function(result) {
                    initCreateForm();
                    getItems();
                });
        }

        function updateItem(item) {
            ItemsModel.update(item.id, item)
                .then(function(result) {
                    cancelEditing();
                    getItems();
                });
        }

        function deleteItem(itemId) {
            ItemsModel.destroy(itemId)
                .then(function(result) {
                    cancelEditing();
                    getItems();
                });
        }

        function initCreateForm() {
            viagens.newItem = { name: '', description: '' };
        }

        function setEditedItem(item) {
            viagens.editedItem = angular.copy(item);
            viagens.isEditing = true;
        }

        function isCurrentItem(itemId) {
            return viagens.editedItem !== null && viagens.editedItem.id === itemId;
        }

        function cancelEditing() {
            viagens.editedItem = null;
            viagens.isEditing = false;
        }

        viagens.items = [];
        viagens.editedItem = null;
        viagens.isEditing = false;
        viagens.getItems = getItems;
        viagens.createItem = createItem;
        viagens.updateItem = updateItem;
        viagens.deleteItem = deleteItem;
        viagens.setEditedItem = setEditedItem;
        viagens.isCurrentItem = isCurrentItem;
        viagens.cancelEditing = cancelEditing;

        initCreateForm();
        getItems();
    })

//Momentos serviço
.service('ItemsModelM', function($http, ENDPOINT_URI) {
    var service = this,
        path = 'momentos';

    function getUrl() {
        return ENDPOINT_URI + path;
    }

    function getUrlForId(itemId) {
        return getUrl(path) + itemId;
    }

    service.all = function() {
        return $http.get(getUrl());
    };

    service.fetch = function(itemId) {
        return $http.get(getUrlForId(itemId));
    };

    service.create = function(item) {
        return $http.post(getUrl(), item);
    };

    service.update = function(itemId, item) {
        return $http.put(getUrlForId(itemId), item);
    };

    service.destroy = function(itemId) {
        return $http.delete(getUrlForId(itemId));
    };
})

// momentos control
.controller('MomentosCtrl', function(ItemsModelM) {
        var momentos = this;

        function getItems() {
            ItemsModelM.all()
                .then(function(result) {
                    momentos.items = result.data;
                });
        }

        function createItem(item) {
            ItemsModelM.create(item)
                .then(function(result) {
                    initCreateForm();
                    getItems();
                });
        }

        function updateItem(item) {
            ItemsModelM.update(item.id, item)
                .then(function(result) {
                    cancelEditing();
                    getItems();
                });
        }

        function deleteItem(itemId) {
            ItemsModelM.destroy(itemId)
                .then(function(result) {
                    cancelEditing();
                    getItems();
                });
        }

        function initCreateForm() {
            momentos.newItem = { name: '', description: '' };
        }

        function setEditedItem(item) {
            momentos.editedItem = angular.copy(item);
            momentos.isEditing = true;
        }

        function isCurrentItem(itemId) {
            return momentos.editedItem !== null && momentos.editedItem.id === itemId;
        }

        function cancelEditing() {
            momentos.editedItem = null;
            momentos.isEditing = false;
        }
        momentos.items = [];
        momentos.editedItem = null;
        momentos.isEditing = false;
        momentos.getItems = getItems;
        momentos.createItem = createItem;
        momentos.updateItem = updateItem;
        momentos.deleteItem = deleteItem;
        momentos.setEditedItem = setEditedItem;
        momentos.isCurrentItem = isCurrentItem;
        momentos.cancelEditing = cancelEditing;
        initCreateForm();
        getItems();
    })
    //
    .constant('weblogngConfig', {
        apiKey: '',
        options: {
            publishNavigationTimingMetrics: true,
            publishUserActive: true,
            application: 'ApiViagens2'
        }
    });