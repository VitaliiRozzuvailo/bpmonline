define('GridSettingsViewGenerator', ['ext-base', 'terrasoft', 'GridSettingsViewGeneratorResources'],
    function(Ext, Terrasoft, resources) {
        var tiledTpl = [
            '<div id="{id}" class="grid">',
            '<div class="grid-row grid-pad grid-active-selectable" id="columnsSettingsGrid">',
            '<tpl for="viewCollection">',
            '<div id="row-{row}" class="grid-row grid-module">',
            '<tpl if="xindex != xcount">',
            '<tpl for="cells">',
            '<tpl if="isNew">',
            '<div id="element-plus-{parent.row}-{column}" class="grid-cols-{width}">',
            '<div class="empty-inner-div">',
            '+',
            '</div>',
            '</div>',
            '<tpl elseif="isEmpty">',
            '<div id="element-empty-{parent.row}-{column}" class="grid-cols-{width}">',
            '<div class="empty-inner-div">',
            '',
            '</div>',
            '</div>',
            '<tpl else>',
            '<div id="element-column-{parent.row}-{column}" class="grid-cols-{width}' +
                '<tpl if="isCurrent"> selected-column<tpl else> unchosen-column</tpl>">' +
                '<div class="column-inner-div' +
                '<tpl if="isTitleText"> grid-header</tpl>">',
            '{caption}',
            '</div>',
            '</div>',
            '</tpl>',
            '</tpl>',
            '<tpl elseif="parent.isTiled || xcount == 1">',
            '<div id="element-plus-{row}" class="grid-cols-2">',
            '<div class="empty-inner-div">',
            '+',
            '</div>',
            '</div>',
            '<tpl for="cells">',
            '<div id="element-empty-{parent.row}-{column}" class="grid-cols-{width}"> ' +
                '<div class="empty-inner-div">',
            '',
            '</div>',
            '</div>',
            '</tpl>',
            '</tpl>',
            '</div>',
            '</tpl>',
            '</div>',
            '</div>'
        ];
        var listedTpl =  [
            '<div id="{id}" class="grid">',
            '<div class="grid-row grid-pad grid-active-selectable" id="columnsSettingsGrid">',
            '<tpl for="listedViewCollection">',
            '<div id="row-{row}" class="grid-row grid-module">',
            '<tpl if="xindex != xcount">',
            '<tpl for="cells">',
            '<tpl if="isNew">',
            '<div id="element-plus-{parent.row}-{column}" class="grid-cols-{width}">',
            '<div class="empty-inner-div">',
            '+',
            '</div>',
            '</div>',
            '<tpl elseif="isEmpty">',
            '<div id="element-empty-{parent.row}-{column}" class="grid-cols-{width}">',
            '<div class="empty-inner-div">',
            '',
            '</div>',
            '</div>',
            '<tpl else>',
            '<div id="element-column-{parent.row}-{column}" class="grid-cols-{width}' +
                '<tpl if="isCurrent"> selected-column<tpl else> unchosen-column</tpl>">' +
                '<div class="column-inner-div' +
                '<tpl if="isTitleText"> grid-header</tpl>">',
            '{caption}',
            '</div>',
            '</div>',
            '</tpl>',
            '</tpl>',
            '<tpl elseif="xcount == 1">',
            '<div id="element-plus-{row}" class="grid-cols-2">',
            '<div class="empty-inner-div">',
            '+',
            '</div>',
            '</div>',
            '<tpl for="cells">',
            '<div id="element-empty-{parent.row}-{column}" class="grid-cols-{width}"> ' +
                '<div class="empty-inner-div">',
            '',
            '</div>',
            '</div>',
            '</tpl>',
            '</tpl>',
            '</div>',
            '</tpl>',
            '</div>',
            '</div>'
        ];
        function getMenuItems() {
            var items = [];

            if (!this.hideCaption) {
                items.push({
                    className: 'Terrasoft.Label',
                    id: 'topCaption',
                    caption: resources.localizableStrings.PageCaption,
                    classes: {
                        labelClass: ['page-caption-label']
                    },
                    width: '100%'
                });
            }
            if (!this.hideButtons) {
                var saveButtonConfig = {
                    id: 'SaveButton',
                    className: 'Terrasoft.Button',
                    style: Terrasoft.controls.ButtonEnums.style.GREEN,
                    caption: resources.localizableStrings.SaveButtonCaption,
                    click: {
                        bindTo: 'SaveSettings'
                    }
                };
                if (this.isSysAdmin) {
                    saveButtonConfig.classes = {wrapperClass: 'save-btn-wrapperClass'};
                    saveButtonConfig.menu = {
                        items: [{
                            id: 'SaveForAllButton',
                            caption: resources.localizableStrings.SaveForAllButtonButtonCaption,
                            click: {bindTo: 'SaveSettingsForAllUsers'}
                        }]
                    };
                } else {
                    saveButtonConfig.classes = {textClass: 'save-btn-textClass'};
                }
                items.push({
                    className: 'Terrasoft.Container',
                    id: 'topSettings',
                    selectors: {
                        wrapEl: '#topSettings'
                    },
                    classes: {
                        wrapClassName: ['top-settings-container']
                    },
                    items: [
                        saveButtonConfig,
                        {
                            id: 'CancelButton',
                            className: 'Terrasoft.Button',
                            style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
                            caption: resources.localizableStrings.CancelButtonCaption,
                            classes: {
                                textClass: ['cancel-button-custom']
                            },
                            click: {
                                bindTo: 'cancelSettings'
                            }
                        }
                    ]
                });
            }
            if (!this.hideGridType) {
                items.push(generateTypeSelectConfig());
            }
            items.push({
                className: 'Terrasoft.Container',
                id: 'columnsSettings',
                selectors: {
                    wrapEl: '#columnsSettings'
                },
                classes: {
                    wrapClassName: ['columns-settings-container']
                },
                tpl: this.isTiled ? tiledTpl : listedTpl,
                tplData: this
            });
            items.push({
                className: 'Terrasoft.Container',
                id: 'bottomSettings',
                selectors: {
                    wrapEl: '#bottomSettings'
                },
                classes: {
                    wrapClassName: ['bottom-settings-container']
                },
                items: [
                    {
                        id: 'SetupButton',
                        className: 'Terrasoft.Button',
                        style: Terrasoft.controls.ButtonEnums.style.BLUE,
                        caption: resources.localizableStrings.SetButtonCaption,
                        classes: {
                            textClass: ['setup-button']
                        },
                        click: {
                            bindTo: 'setupElement'
                        }
                    }, {
                        id: 'DeleteButton',
                        className: 'Terrasoft.Button',
                        style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
                        caption: resources.localizableStrings.DeleteButtonCaption,
                        classes: {
                            textClass: ['delete-button']
                        },
                        click: {
                            bindTo: 'deleteElement'
                        }
                    }, {
                        id: 'ExpandButton',
                        className: 'Terrasoft.Button',
                        style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
                        caption: resources.localizableStrings.ExpandButtonCaption,
                        classes: {
                            textClass: ['expand-button']
                        },
                        click: {
                            bindTo: 'expandElement'
                        }
                    }, {
                        id: 'NarrowButton',
                        className: 'Terrasoft.Button',
                        style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
                        caption: resources.localizableStrings.NarrowButtonCaption,
                        classes: {
                            textClass: ['narrow-button']
                        },
                        click: {
                            bindTo: 'narrowElement'
                        }
                    }
                ]
            });
            return items;
        }
        function generateTypeSelectConfig() {
            return {
                className: 'Terrasoft.Container',
                id: 'typeSelectContainer',
                selectors: {
                    wrapEl: '#typeSelectContainer'
                },
                classes: {
                    wrapClassName: ['columns-settings-type-select-container']
                },
                visible: {
                    bindTo: 'isSingleTypeMode',
                    bindConfig: {
                        converter: function(value) {
                            return !value;
                        }
                    }
                },
                items: [{
                    className: 'Terrasoft.Container',
                    id: 'tiledRadioContainer',
                    selectors: {
                        wrapEl: '#tiledRadioContainer'
                    },
                    classes: {
                        wrapClassName: ['columns-settings-type-item-container']
                    },
                    items: [{
                        id: 'tiledRadio',
                        className: 'Terrasoft.RadioButton',
                        tag: 'tiled',
                        checked: {
                            bindTo: 'GridType'
                        }
                    }, {
                        className: 'Terrasoft.Label',
                        caption: resources.localizableStrings.TiledCaption,
                        inputId: 'tiledRadio-el'
                    }]
                }, {
                    className: 'Terrasoft.Container',
                    id: 'listedRadioContainer',
                    selectors: {
                        wrapEl: '#listedRadioContainer'
                    },
                    classes: {
                        wrapClassName: ['columns-settings-type-item-container']
                    },
                    items: [{
                        id: 'listedRadio',
                        className: 'Terrasoft.RadioButton',
                        tag: 'listed',
                        checked: {
                            bindTo: 'GridType'
                        }
                    }, {
                        className: 'Terrasoft.Label',
                        caption: resources.localizableStrings.ListedCaption,
                        inputId: 'listedRadio-el'
                    }]
                }]
            };
        }
        function getViewConfig() {
            var view = {
                className: 'Terrasoft.Container',
                id: 'gridSettings',
                selectors: {
                    wrapEl: '#gridSettings'
                },
                classes: {
                    wrapClassName: ['grid-settings']
                },
                items: getMenuItems.call(this)
            };
            return view;
        }
        return {
            generate: getViewConfig,
            listedTpl: listedTpl,
            tiledTpl: tiledTpl
        };
    });