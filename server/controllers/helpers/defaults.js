'use strict';

exports.emptyGroup = function() {
    this.name = '',
    this.group = '',
    this.login = true,
    this.paths = []
};

exports.emptyCType = function() {
    this.name = '',
    this.type = '',
    this.content = [],
    this.author = '',
    this.date = new Date(),
    this.permalink = '',
    this.groups = [],
    this.category = [],
    this.source = [{"db":"default","alias":[]}]
};

exports.defaultGroups = [
    {
        name: 'Admin',
        group: 'admin',
        login: true,
        paths: [
            '/admin/*',
            '/*'
        ]
    },
    {
        name: 'Guest',
        group: 'guest',
        login: false,
        paths: [
            '/*'
        ]
    }
];


exports.defaultMenu = [
    {
        name: 'dashboard',
        type : 'menus',
        content : [{
            name: 'Dashboard',
            path: '#/',
            weight: 0,
            icon : 'line-chart',
            childs: {}
        }],
        author : 'system',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        category: [],
        template: '',
        source: [{db:'default',alias:[]}]
    },
    {
        name: 'contenttypes',
        type : 'menus',
        content : [{
            name: 'Content Types',
            path: '#/contenttypes',
            weight: 1,
            icon : 'code',
            childs:{
                add: {name: 'Add', path: '/add'},
                edit: {name: 'Edit', path: '/edit'}
            }
        }],
        author : 'system',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        category: [],
        template: '',
        source: [{db:'default',alias:[]}]
    },
    {
        name: 'users',
        type : 'menus',
        content : [{
            name: 'Users',
            path: '#/users',
            weight: 2,
            icon : 'user',
            childs:{
                add: {name: 'Add', path: '/add'},
                edit: {name: 'Edit', path: '/edit'}
            }
        }],
        author : 'admin',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        category: [],
        template: '',
        source: [{db:'default',alias:[]}]
    },
    {
        name: 'groups',
        type : 'menus',
        content : [{
            name: 'Groups',
            path: '#/groups',
            weight: 3,
            icon : 'sliders',
            childs:{
                add: {name: 'Add', path: '/add'},
                edit: {name: 'Edit', path: '/edit'}
            }
        }],
        author : 'admin',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        category: [],
        template: '',
        source: [{db:'default',alias:[]}]
    },
    {
        name: 'categories',
        type : 'menus',
        content : [{
            name: 'Categories',
            path: '#/categories',
            weight: 4,
            icon : 'database',
            childs:{
                add: {name: 'Add', path: '/add'},
                edit: {name: 'Edit', path: '/edit'}
            }
        }],
        author : 'admin',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        category: [],
        template: '',
        source: [{db:'default',alias:[]}]
    },
    {
        name: 'menus',
        type : 'menus',
        content : [{
            name: 'Menus',
            path: '#/menus',
            weight: 5,
            icon : 'chain',
            childs:{
                add: {name: 'Add', path: '/add'},
                edit: {name: 'Edit', path: '/edit'}
            }
        }],
        author : 'admin',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        category: [],
        template: '',
        source: [{db:'default',alias:[]}]
    },
    {
        name: 'media',
        type : 'menus',
        content : [{
            name: 'Media',
            path: '#/media',
            weight: 5,
            icon : 'copy',
            childs:{
                add: {name: 'Add', path: '/add'},
                edit: {name: 'Edit', path: '/edit'}
            }
        }],
        author : 'admin',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        category: [],
        template: '',
        source: [{db:'default',alias:[]}]
    },
    {
        name: 'settings',
        type : 'menus',
        content : [{
            name: 'Settings',
            path: '#/settings',
            weight: 5,
            icon : 'cogs',
            childs:{
                edit: {name: 'Edit', path: '/edit'}
            }
        }],
        author : 'admin',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        category: [],
        template: '',
        source: [{db:'default',alias:[]}]
    },
/*    {
        name: 'activity',
        type : 'menus',
        content : [{
            name: 'Activity',
            path: '#/activity',
            weight: 5,
            icon : 'cubes',
            childs:{
                add: {name: 'Add', path: '/add'},
                edit: {name: 'Edit', path: '/edit'}
            }
        }],
        author : 'admin',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        category: [],
        source: [{db:'default',alias:[]}]
    },*/
    {
        name: 'categories',
        type : 'contenttypes',
        content : [],
        author : 'admin',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        content : [{icon : 'database'}],
        category: [],
        template: '',
        source: [{db:'default',alias:[]}]
    },
    {
        name: 'users',
        type : 'contenttypes',
        content : [],
        author : 'admin',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        category: [],
        template: '',
        content : [{icon : 'user'}],
        source: [{db:'default',alias:[]}]
    },
    {
        name: 'groups',
        type : 'contenttypes',
        content : [],
        author : 'admin',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        category: [],
        template: '',
        content : [{icon : 'sliders'}],
        source: [{db:'default',alias:[]}]
    },
    {
        name: 'menus',
        type : 'contenttypes',
        content : [],
        author : 'admin',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        category: [],
        template: '',
        content : [{icon : 'chain'}],
        source: [{db:'default',alias:[]}]
    },
    {
        name: 'media',
        type : 'contenttypes',
        content : [],
        author : 'admin',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        category: [],
        template: '',
        content : [{icon : 'copy'}],
        source: [{db:'default',alias:[]}]
    },
    {
        name: 'settings',
        type : 'contenttypes',
        content : [],
        author : 'admin',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        category: [],
        template: '',
        content : [{icon : 'cogs', menus: {default:['settings'], template:['header', 'footer', 'sidebar']}}],
        source: [{db:'default',alias:[]}]
    },
    {
        name: 'header',
        type : 'contenttypes',
        content : [],
        author : 'admin',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        category: [],
        template: '',
        content : [{icon : ''}],
        source: [{db:'default',alias:[]}]
    }
    ,
    {
        name: 'footer',
        type : 'contenttypes',
        content : [],
        author : 'admin',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        category: [],
        template: '',
        content : [{icon : ''}],
        source: [{db:'default',alias:[]}]
    }
    ,
    {
        name: 'sidebar',
        type : 'contenttypes',
        content : [],
        author : 'admin',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        category: [],
        template: '',
        content : [{icon : ''}],
        source: [{db:'default',alias:[]}]
    }
    /*,
    {
        name: 'activity',
        type : 'contenttypes',
        content : [],
        author : 'admin',
        date : new Date(),
        permalink : '',
        groups : [{name: 'Admin', group: 'admin'}],
        category: [],
        source: [{db:'default',alias:[]}]
    }*/
];
