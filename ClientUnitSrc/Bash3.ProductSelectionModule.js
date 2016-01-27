define("ProductSelectionModule", ["ProductSelectionModuleResources", "ProductSelectionView",
        "ProductSelectionViewModel", "MaskHelper", "BaseSchemaModuleV2"],
    function(resources, moduleView, moduleViewModel, MaskHelper) {
        /**
         * @class Terrasoft.configuration.ProductSelectionModule
         * Класс ProductSelectionModule предназначен для создания модуля выбора продуктов
         */
        Ext.define("Terrasoft.configuration.ProductSelectionModule", {
            alternateClassName: "Terrasoft.ProductSelectionModule",
            extend: "Terrasoft.BaseSchemaModule",

            Ext: null,
            sandbox: null,
            Terrasoft: null,

            /**
             * Настройки для менеджера групп
             * @private
             * @type {Object}
             */
            config: null,

            /**
             * Содержит контейнер для отрисовки
             * @private
             * @type {Object}
             */
            container: null,

            /**
             * Содержит список сообщений модуля
             * @protected
             * @type {Object}
             */
            messages: null,

            /**
             * Модель представления менеджера групп
             * @private
             * @type {Object}
             */
            viewModel: null,

            /**
             * Представление модели менеджера групп
             * @private
             * @type {Object}
             */
            view: null,

            /**
             * Инициализация модуля.
             * @param {Function} callback Функция обратного вызова.
             * @param {Object} scope Контест вызова функции обратного вызова.
             */
            init: function(callback, scope) {
                MaskHelper.ShowBodyMask();
                this.registerMessages();
                this.config = this.sandbox.publish("ProductSelectionInfo", null, [this.sandbox.id]) || {};
                this.sandbox.requireModuleDescriptors(["Product"], function() {
                    this.Terrasoft.require(["Product"], function(schema) {
                        this.config.EntitySchema = schema;
                        Terrasoft.SysSettings.querySysSettingsItem("BasePriceList",
                            function(value) {
                                this.config.BasePriceList = value;
                                if (callback) {
                                    callback.call(scope || this);
                                }
                            }, this);
                    }, this);
                }, this);
            },

            /**
             * Расширяет конфигурацию сообщений модуля
             * @protected
             */
            registerMessages: function() {
                var messages = {
                    "ProductSelectionSave": {
                        mode: Terrasoft.MessageMode.PTP,
                        direction: Terrasoft.MessageDirectionType.PUBLISH
                    },

                    "ReloadOrderPageValues":{
                        mode: Terrasoft.MessageMode.PTP,
                        direction: Terrasoft.MessageDirectionType.PUBLISH
                    },
                    "ProductSelectionInfo": {
                        mode: Terrasoft.MessageMode.PTP,
                        direction: Terrasoft.MessageDirectionType.PUBLISH
                    },
                    "BackHistoryState": {
                        mode: Terrasoft.MessageMode.BROADCAST,
                        direction: Terrasoft.MessageDirectionType.PUBLISH
                    },
                    "FolderInfo": {
                        mode: Terrasoft.MessageMode.PTP,
                        direction: Terrasoft.MessageDirectionType.SUBSCRIBE
                    },
                    "ShowFolderManager": {
                        mode: Terrasoft.MessageMode.PTP,
                        direction: Terrasoft.MessageDirectionType.SUBSCRIBE
                    },
                    "ResultFolderFilter": {
                        mode: Terrasoft.MessageMode.BROADCAST,
                        direction: Terrasoft.MessageDirectionType.SUBSCRIBE
                    },
                    "UpdateCatalogueFilter": {
                        mode: Terrasoft.MessageMode.BROADCAST,
                        direction: Terrasoft.MessageDirectionType.SUBSCRIBE
                    },
                    "QuickSearchFilterInfo": {
                        mode: Terrasoft.MessageMode.PTP,
                        direction: Terrasoft.MessageDirectionType.SUBSCRIBE
                    },
                    "UpdateQuickSearchFilter": {
                        mode: Terrasoft.MessageMode.BROADCAST,
                        direction: Terrasoft.MessageDirectionType.SUBSCRIBE
                    },
                    "UpdateQuickSearchFilterString": {
                        mode: Terrasoft.MessageMode.PTP,
                        direction: Terrasoft.MessageDirectionType.PUBLISH
                    },
                    "ChangeDataView": {
                        mode: Terrasoft.MessageMode.PTP,
                        direction: Terrasoft.MessageDirectionType.SUBSCRIBE
                    },
                    "GetCurrency": {
                        mode: Terrasoft.MessageMode.PTP,
                        direction: Terrasoft.MessageDirectionType.PUBLISH
                    },
                    "GetCountry": {
                        mode: Terrasoft.MessageMode.PTP,
                        direction: Terrasoft.MessageDirectionType.PUBLISH
                    }
                };
                this.sandbox.registerMessages(messages);
            },

            /**
             * Отрисовывает представление модуля менеджера групп.
             * @param {Ext.Element} renderTo.
             */
            render: function(renderTo) {
                this.container = renderTo;
                this.initializeModule();
            },

            /**
             * Инициализирует модель представления модуля выбора продуктов
             * @protected
             */
            initializeModule: function() {
                MaskHelper.ShowBodyMask();
                if (!this.viewModel) {
                    var viewModelConfig = moduleViewModel.generate(this.sandbox, this.Terrasoft, this.Ext, this.config);
                    this.viewModel = this.Ext.create("Terrasoft.BaseViewModel", viewModelConfig);
                    this.viewModel.init(this.config);
                }
                var viewConfig = moduleView.generate();
                this.view = this.Ext.create("Terrasoft.Container", viewConfig);
                this.view.bind(this.viewModel);
                this.view.render(this.container);
                this.loadModules();
            },

            /**
             * Загружает модули
             * @protected
             */
            loadModules: function() {
                this.viewModel.loadFolderManager("foldersContainer");
                this.viewModel.loadQuickSearchModule("searchContainer");
            },

            /**
             * Очищает все подписки на события и уничтожает объект.
             * @overridden
             * @param {Object} config Параметры уничтожения модуля
             */
            destroy: function(config) {
                if (config.keepAlive !== true) {
                    if (this.viewModel) {
                        this.viewModel.unRegisterMessages();
                        this.viewModel = null;
                    }
                    this.callParent(arguments);
                }
            }
        });
        return Terrasoft.ProductSelectionModule;
    });
