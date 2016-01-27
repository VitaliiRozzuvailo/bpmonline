define("NotificationsModule", ["NotificationsModuleResources", "ViewUtilities", "RemindingsUtilities",
        "NetworkUtilities", "ProcessModuleUtilities", "ContainerList", "BaseModule", "css!NotificationsModule"],
    function(resources, ViewUtilities, RemindingsUtilities, NetworkUtilities, ProcessModuleUtilities) {

        resources.localizableImages.More = {
            source: Terrasoft.ImageSources.SOURCE_CODE_SCHEMA,
            params: { schemaName: 'NotificationsModule', resourceItemName: 'More' }};
        resources.localizableImages.ActivityImage = {
            source: Terrasoft.ImageSources.SOURCE_CODE_SCHEMA,
            params: { schemaName: 'NotificationsModule', resourceItemName: 'ActivityImage' }};
        resources.localizableImages.DocumentImage = {
            source: Terrasoft.ImageSources.SOURCE_CODE_SCHEMA,
            params: { schemaName: 'NotificationsModule', resourceItemName: 'DocumentImage' }};
        resources.localizableImages.EmptyImage = {
            source: Terrasoft.ImageSources.SOURCE_CODE_SCHEMA,
            params: { schemaName: 'NotificationsModule', resourceItemName: 'EmptyImage' }};
        resources.localizableStrings.MainActionsButtonCaption = 'Действия';
        resources.localizableStrings.PostponeAllMenuItemCaption = 'Отложить все';
        resources.localizableStrings.CancelAllMenuItemCaption = 'Отменить все';
        resources.localizableStrings.PostponeMenuItemCaption = 'Отложить';
        resources.localizableStrings.CancelMenuItemCaption = 'Отменить';
        resources.localizableStrings.MenuItem5MinCaption = '5 минут';
        resources.localizableStrings.MenuItem10MinCaption = '10 минут';
        resources.localizableStrings.MenuItem30MinCaption = '30 минут';
        resources.localizableStrings.MenuItem1HourCaption = '1 час';
        resources.localizableStrings.MenuItem2HourCaption = '2 часа';
        resources.localizableStrings.MenuItem1DayCaption = '1 день';
        resources.localizableStrings.PostponeAllNotificationsQuestion = 'Вы действительно хотите отложить все напоминания?';
        resources.localizableStrings.CancelAllNotificationsQuestion = 'Вы действительно хотите отменить все напоминания?';
        resources.localizableStrings.ShowMoreThanOneNewNotifications = 'Показать {0} новых напоминаний';
        resources.localizableStrings.ShowNewNotification = 'Показать 1 новое напоминание';
        /**
         * @class Terrasoft.configuration.NotificationsModule
         * Класс NotificationsModule предназначен для создания экземпляра раздела Уведомления
         */
        Ext.define("Terrasoft.configuration.NotificationsModule", {
            alternateClassName: "Terrasoft.NotificationsModule",
            extend: "Terrasoft.BaseModule",
            Ext: null,
            sandbox: null,
            Terrasoft: null,

            /**
             * Последний выбранный элемент напоминания
             * @private
             */
            LastSelectedRow: null,

            /**
             * Номер строки реестра с конца, при появлении которого в видимой области происходит дозагрузка
             * уведомлений
             * @private
             */
            ObservableRows: 1,

            /**
             * Создает контейнер для размещения текста о новых уведомлениях
             * @private
             * @return {Object} Возвращает экземпляр конфигурации контейнера
             */
            getMessageContainer: function() {
                return {
                    className: "Terrasoft.Container",
                    id: "messageContainer",
                    selectors: {wrapEl: "#messageContainer"},
                    classes: {wrapClassName: ["showNewNotificationContainer-class"]},
                    visible: {bindTo: "ShowNewNotificationsVisible"},
                    items: [
                        {
                            className: "Terrasoft.Button",
                            caption: {bindTo: "getShowNewNotificationText"},
                            classes: {textClass: ["showNewNotificationButton-class"]},
                            style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
                            iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.LEFT,
                            imageConfig: {
                                source: Terrasoft.ImageSources.URL,
                                url: Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.More)
                            },
                            click: {bindTo: "onShowNewNotificationClick"}
                        }
                    ]
                };
            },

            /**
             * Формирует конфигурацию меню кнопки Отложить у элемента уведомления
             * @param {String} bindToFunction Имя функции, которая присваивается к пункту меню
             * @private
             * @return {Array} Возвращает конфигурацию меню кнопки Отложить
             */
            getNotificationActionButtonMenuItems: function(bindToFunction) {
                return [{
                    caption: resources.localizableStrings.MenuItem5MinCaption,
                    tag: ["5"],
                    click: {bindTo: bindToFunction}
                }, {
                    caption: resources.localizableStrings.MenuItem10MinCaption,
                    tag: ["10"],
                    click: {bindTo: bindToFunction}
                }, {
                    caption: resources.localizableStrings.MenuItem30MinCaption,
                    tag: ["30"],
                    click: {bindTo: bindToFunction}
                }, {
                    caption: resources.localizableStrings.MenuItem1HourCaption,
                    tag: ["60"],
                    click: {bindTo: bindToFunction}
                }, {
                    caption: resources.localizableStrings.MenuItem2HourCaption,
                    tag: ["120"],
                    click: {bindTo: bindToFunction}
                }, {
                    caption: resources.localizableStrings.MenuItem1DayCaption,
                    tag: ["1440"],
                    click: {bindTo: bindToFunction}
                }];
            },

            /**
             * Создает контейнер для размещения главной кнопки дейтвий над уведомлениями
             * @private
             * @return {Object} Возвращает экземпляр конфигурации контейнера
             */
            getMainActionsButtonContainer: function() {
                var mainActionsButtonContainer = ViewUtilities.getContainerConfig("mainActionsButtonContainer",
                    ["main-actions-button-container"]);
                mainActionsButtonContainer.items.push({
                    className: "Terrasoft.Button",
                    style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
                    caption: resources.localizableStrings.PostponeAllMenuItemCaption,
                    classes: {
                        wrapperClass: ["postpone-all-class"],
                        menuClass: ["postpone-all-menuClass"]
                    },
                    menu: {items: this.getNotificationActionButtonMenuItems("postponeAll")}
                });
                mainActionsButtonContainer.items.push({
                    className: "Terrasoft.Button",
                    style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
                    classes: {textClass: ["cancel-all-class"]},
                    caption: resources.localizableStrings.CancelAllMenuItemCaption,
                    click: {bindTo: "cancelAll"}
                });
                return mainActionsButtonContainer;
            },

            /**
             * Возвращает экземпляр конфигурации эелемента уведомления
             * @private
             * @return {Object} Возвращает экземпляр контейнера для элемента уведомления
             */
            getNotificationItemConfig: function() {
                var notificationItemConfig;
                notificationItemConfig = ViewUtilities.getContainerConfig("notificationItemContainer",
                    ["notification-item-container"]);
                var notificationItemTopContainer = ViewUtilities.getContainerConfig("notificationItemTopContainer",
                    ["notification-item-top-container"]);
                notificationItemTopContainer.items.push({
                    className: "Terrasoft.ImageView",
                    imageSrc: {bindTo: "getNotificationImage"},
                    classes: {wrapClass: ["notification-icon-class"]}
                });
                notificationItemTopContainer.items.push({
                    className: "Terrasoft.Label",
                    caption: {bindTo: "getNotificationDateTime"},
                    classes: {labelClass: ["date-time-labelClass"]}
                });
                notificationItemTopContainer.items.push({
                    className: "Terrasoft.Button",
                    style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
                    classes: {wrapperClass: ["notificationActionButtonWrap-class"]},
                    menu: {
                        items: [{
                            caption: resources.localizableStrings.PostponeMenuItemCaption,
                            menu: {items: this.getNotificationActionButtonMenuItems("postpone")}
                        }, {
                            caption: resources.localizableStrings.CancelMenuItemCaption,
                            click: {bindTo: "cancel"}
                        }]
                    }
                });
                notificationItemTopContainer.items.push({
                    className: "Terrasoft.Label",
                    caption: {bindTo: "getNotificationButtonCaption"},
                    classes: {labelClass: ["button-caption-labelClass"]}
                });
                notificationItemConfig.items.push(notificationItemTopContainer);
                var notificationItemBottomContainer =
                    ViewUtilities.getContainerConfig("notificationItemBottomContainer",
                        ["notification-item-bottom-container"]);
                notificationItemBottomContainer.items.push({
                    className: "Terrasoft.Label",
                    caption: {bindTo: "getNotificationSubjectCaption"},
                    click: {bindTo: "onNotificationSubjectClick"},
                    classes: {labelClass: ["subject-text-labelClass", "label-link", "label-url"]}
                });
                notificationItemConfig.items.push(notificationItemBottomContainer);
                var notification = ViewUtilities.getContainerConfig("notification", ["notification-container"]);
                notification.items.push(notificationItemConfig);
                return notification;
            },

            /**
             * Создает контейнер, в котором будут отображаться уведомления
             * @private
             * @return {Object} Возвращает экземпляр конфигурации контейнера
             */
            getNotificationsContainer: function() {
                var notificationItemsContainer = ViewUtilities.getContainerConfig("notificationItemsContainer",
                    ["default-notification-items-container-class"]);
                notificationItemsContainer.items.push({
                    className: "Terrasoft.ContainerList",
                    id: this.sandbox.id + "_notification-items-container-list",
                    idProperty: "Id",
                    selectors: {wrapEl: "#" + this.sandbox.id + "_notification-items-container-list"},
                    collection: {bindTo: "Notifications"},
                    observableRowNumber: this.ObservableRows,
                    observableRowVisible: {bindTo: "onLoadNext"},
                    defaultItemConfig: this.getNotificationItemConfig()
                });
                return notificationItemsContainer;
            },

            /**
             * Создает экземпляр представления
             * @protected
             * @vitrtual
             * @return {Terrasoft.Container} Возвращает экземпляр представления
             */
            getView: function() {
                var viewItems = [];
                viewItems.push(this.getMainActionsButtonContainer());
                viewItems.push(this.getMessageContainer());
                viewItems.push(Terrasoft.deepClone(this.getNotificationsContainer()));
                return this.Ext.create("Terrasoft.Container", {
                    id: "notifications",
                    selectors: {wrapEl: "#notifications"},
                    classes: {wrapClassName: ["notifications-main-container"]},
                    items: viewItems
                });
            },

            /**
             * Создает экземпляр модели представления
             * @protected
             * @return {Terrasoft.BaseViewModel} Возвращает экземпляр модели представления
             */
            getViewModel: function() {
                var scope = this;
                var sandbox = scope.sandbox;
                var Terrasoft = scope.Terrasoft;
                var viewModel = Ext.create("Terrasoft.BaseViewModel", {
                    values: {

                        /**
                         * Коллекция уведомлений
                         * @private
                         */
                        Notifications: new Terrasoft.Collection(),

                        /**
                         * Признак видимости контейнера с напоминанием о новых уведомлениях
                         * @private
                         */
                        ShowNewNotificationsVisible: false,

                        /**
                         * Количество новых уведомлений
                         * @private
                         */
                        NewNotificationsCount: 0,

                        /**
                         * Общее количество уведомлений
                         * @private
                         */
                        CommonNotificationsCount: 0,

                        /**
                         * Количество не прочитанных уведомлений
                         * @private
                         */
                        NotOpenedNotificationsCount: 0
                    },
                    methods: {

                        /**
                         * Формирует путь к изображению для текущего уведомления согласно типу уведомления
                         * @private
                         * @returns {String} Возвращает сформированный путь к изображению
                         */
                        getNotificationImage: function() {
                            debugger;
                            var schemaName = this.get("SchemaName");
                            if (schemaName=="SxVwContactAndOrder")
                                var moduleStructure = Terrasoft.configuration.ModuleStructure["SxVwOrderCont"];
                            else
                                var moduleStructure = Terrasoft.configuration.ModuleStructure[schemaName];
                            if (!moduleStructure) {
                                return "";
                            }
                            var imageId = moduleStructure.logoId ||
                                Terrasoft.configuration.ModuleStructure.Activity.logoId;
                            return Terrasoft.ImageUrlBuilder.getUrl({
                                source: Terrasoft.ImageSources.ENTITY_COLUMN,
                                params: {
                                    schemaName: "SysImage",
                                    columnName: "Data",
                                    primaryColumnValue: imageId
                                }
                            });
                        },

                        /**
                         * Обработчик нажатия кнопки показа новых уведомлений
                         * @private
                         */
                        onShowNewNotificationClick: function() {
                            var notifications = this.get("Notifications");
                            notifications.clear();
                            var notificationItemsContainer = Ext.get("notificationItemsContainer");
                            if (notificationItemsContainer.hasCls("offset-notification-items-container-class")) {
                                notificationItemsContainer.removeCls("offset-notification-items-container-class");
                                notificationItemsContainer.addCls("default-notification-items-container-class");
                            }
                            this.set("ShowNewNotificationsVisible", false);
                            this.set("NotOpenedNotificationsCount", 0);
                            this.loadNotifications(true);
                        },

                        /**
                         * Возвращает текст с количеством новых уведомлений
                         * @private
                         */
                        getShowNewNotificationText: function() {
                            var newNotificationsCount = this.get("NewNotificationsCount");
                            if (newNotificationsCount === 0) {
                                this.set("ShowNewNotificationsVisible", false);
                            } else if (newNotificationsCount > 1) {
                                return Ext.String.format(resources.localizableStrings.ShowMoreThanOneNewNotifications,
                                    newNotificationsCount);
                            } else {
                                return resources.localizableStrings.ShowNewNotification;
                            }
                        },

                        /**
                         * Получает дату/время уведомления
                         * @private
                         * @return {Ext.Date} Возвращает дату уведомления
                         */
                        getNotificationDateTime: function() {
                            var remindTime = this.get("RemindTime");
                            if (this.get("Description")=="Link to Order")
                                return "";
                            else
                                return Terrasoft.getTypedStringValue(remindTime, Terrasoft.DataValueType.DATE_TIME);
                        },

                        /**
                         * Получает подпись функциональной кнопки уведомления
                         * @private
                         */
                        getNotificationButtonCaption: function() {
                            var caption = this.get("TypeCaption");
                            if (Ext.isEmpty(caption)) {
                                caption = this.get("SysEntitySchema").displayValue;
                            }
                            return caption;
                        },

                        /**
                         * Получает содержимое уведомления
                         * @private
                         */
                        getNotificationSubjectCaption: function() {
                            return this.get("SubjectCaption");
                        },

                        /**
                         * Обрабатывает нажатие на гипер-ссылку уведомления. Обеспечивает переход к сущности,
                         * которая инициировала уведомление
                         * @private
                         */
                        onNotificationSubjectClick: function() {
                            var schemaName = this.get("SchemaName");
                            var moduleStructure = Terrasoft.configuration.ModuleStructure[schemaName];
                            if (moduleStructure)
                                var attribute = moduleStructure.attribute;
                            else
                                var attribute=undefined;
                            var entityId = this.get("SubjectId");
                            var typeId = null;
                            var hash;
                            if (attribute) {
                                var select = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: schemaName});
                                select.addColumn(attribute);
                                if (schemaName === "Activity") {
                                    select.addColumn("ProcessElementId");
                                }
                                select.getEntity(entityId, function(result) {
                                    if (result && result.success) {
                                        var entity = result.entity;
                                        typeId = entity.get(attribute).value;
                                        if (schemaName === "Activity") {
                                            var prcElId = entity.get("ProcessElementId");
                                            if (ProcessModuleUtilities.tryShowProcessCard.call(this, prcElId, entityId)) {
                                                return;
                                            }
                                        }
                                        hash = NetworkUtilities.getEntityUrl(schemaName, entityId, typeId);
                                        sandbox.publish("PushHistoryState", {hash: hash});
                                    }
                                }, this);
                            } else if (schemaName === "SxVwContactAndOrder") {
                                debugger;
                                //var sxRoutesIds = this.get("Description");
                               /* window.SxLastApproveProcessReminding = this.get("Id");
                                window.SxApprovalRoutesIds = sxRoutesIds;
                                if(window.location.hash === "#SectionModuleV2/SxRoutesSection/") {
                                    Ext.ComponentManager.all.map.SxRoutesSectionContainer.model
                                        .filterSxRoutesSection({values: sxRoutesIds.split(';')});
                                } else {*/
                                    sandbox.publish("PushHistoryState", {hash: "SectionModuleV2/SxVwOrderContSection/"});
                                /*}
                                var esq = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "SxRoutes"});
                                esq.addColumn("Id");
                                esq.filters.add("SxRouteStatus", this.Terrasoft.createColumnFilterWithParameter(
                                    Terrasoft.ComparisonType.EQUAL, "SxRouteStatus",
                                    "7873e2eb-2a70-44e3-9526-615a1c46c8ec"));
                                esq.filters.addItem(Terrasoft.createColumnInFilterWithParameters(
                                    "Id", sxRoutesIds.split(';')));
                                esq.getEntityCollection(function(result) {
                                    var items = null;
                                    if (result.success) {
                                        items = result.collection;
                                    }
                                    window.ActualSxRoutesToApprove = items;
                                }, this);*/
                            } else {
                                hash = NetworkUtilities.getEntityUrl(schemaName, entityId);
                                sandbox.publish("PushHistoryState", {hash: hash});
                            }
                        },
                        /**
                         * Обновляет дату элемента уведомления в базе данных
                         * @param {Object} updateConfig Конфигурационные данные для обновления. notificationId содержит
                         * уникальный идентификатор элемента уведомления, который требуется обновить. dateValue содержит
                         * значение даты, которую нужно установить у элемента уведомления
                         * @param {Function} callback Содержит функцию, которая будет вызвана после операции обновления
                         * @param {Object} scope Контекст элемента уведомления
                         * @private
                         */
                        updateNotificationItemRemindTime: function(updateConfig, callback, scope) {
                            var update = Ext.create("Terrasoft.UpdateQuery", {
                                rootSchemaName: "Reminding"
                            });
                            var filters = update.filters;
                            filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
                                "Id", updateConfig.notificationId));
                            filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
                                "SysEntitySchema.SysWorkspace.Id", Terrasoft.SysValue.CURRENT_WORKSPACE.value));
                            update.setParameterValue("RemindTime", updateConfig.dateValue,
                                Terrasoft.DataValueType.DATE_TIME);
                            update.execute(function(response) {
                                if (response.success && callback) {
                                    callback.call(scope);
                                }
                            });
                        },

                        /**
                         * Удаляет элемент уведомления из коллекции Notifications. Посылает сообщение на обновление
                         * количества уведомлений в подписи вкладки
                         * @private
                         */
                        deleteNotificationItem: function() {
                            this.sandbox.publish("UpdateRemindingsCount");
                            var notifications = this.parrentViewModel.get("Notifications");
                            debugger;
                            notifications.removeByKey(this.get("Id"));
                        },

                        /**
                         * Выполняет обработку события пункта меню Отложить
                         * @param {Object} menuItem Элемент меню кнопки, который был вызван
                         * @private
                         */
                        postpone: function(menuItem) {
                            var updateConfig = {
                                notificationId: this.get("Id"),
                                dateValue: Ext.Date.add(new Date(Date.now()), Ext.Date.MINUTE, parseInt(menuItem[0], 0))
                            };
                            this.updateNotificationItemRemindTime(updateConfig, function() {
                                this.deleteNotificationItem();
                                this.decrementCommonNotificationsCount();
                            }, this);
                        },

                        /**
                         * Обнуляет значения для свойств модели представления. Приводит расположение панелей вкладки
                         * в исходное состояние
                         * @private
                         */
                        resetValues: function() {
                            this.set("CommonNotificationsCount", 0);
                            this.set("NotOpenedNotificationsCount", 0);
                            this.set("NewNotificationsCount", 0);
                            this.set("ShowNewNotificationsVisible", false);
                            var notificationItemsContainer = Ext.get("notificationItemsContainer");
                            if (notificationItemsContainer.hasCls("offset-notification-items-container-class")) {
                                notificationItemsContainer.removeCls("offset-notification-items-container-class");
                                notificationItemsContainer.addCls("default-notification-items-container-class");
                            }
                        },

                        /**
                         * Выполняет обработку события пункта меню Отложить основной кнопки Действия
                         * @param {Object} menuItem Элемент меню кнопки, который был вызван
                         * @private
                         */
                        postponeAll: function(menuItem) {
                            var tagValue = menuItem[0];
                            var notifications = this.get("Notifications");
                            if (notifications.getCount() <= 0) {
                                return;
                            }
                            var question =
                                Ext.String.format(resources.localizableStrings.PostponeAllNotificationsQuestion);
                            Terrasoft.utils.showConfirmation(question, function(returnCode) {
                                if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
                                    var update = Ext.create("Terrasoft.UpdateQuery", {
                                        rootSchemaName: "Reminding"
                                    });
                                    update.filters = RemindingsUtilities.remindingFilters();
                                    update.setParameterValue("RemindTime", Ext.Date.add(new Date(Date.now()),
                                        Ext.Date.MINUTE, parseInt(tagValue, 0)), Terrasoft.DataValueType.DATE_TIME);
                                    update.execute(function(response) {
                                        if (response.success) {
                                            sandbox.publish("UpdateRemindingsCount");
                                            notifications.clear();
                                            this.resetValues();
                                        }
                                    }, this);
                                }
                            }, ["yes", "no"], this, null);
                        },

                        /**
                         * Выполняет декремент на единицу значения CommonNotificationsCount
                         * @private
                         */
                        decrementCommonNotificationsCount: function() {
                            var parrentViewModel = this.parrentViewModel;
                            var commonNotificationsCount = parrentViewModel.get("CommonNotificationsCount");
                            parrentViewModel.set("CommonNotificationsCount", commonNotificationsCount - 1);
                        },

                        /**
                         * Отменяет уведомление. При этой операции удаляется запись уведомления из базы данных
                         * @private
                         */
                        cancel: function() {
                            var deleteQuery = Ext.create("Terrasoft.DeleteQuery", {
                                rootSchemaName: "Reminding"
                            });
                            var filters = deleteQuery.filters;
                            var idFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
                                "Id", this.get("Id"));
                            filters.add("IdFilter", idFilter);
                            var workspaceIdFilter = Terrasoft.createColumnFilterWithParameter(
                                Terrasoft.ComparisonType.EQUAL,
                                "SysEntitySchema.SysWorkspace.Id", Terrasoft.SysValue.CURRENT_WORKSPACE.value);
                            filters.add("WorkspaceIdFilter", workspaceIdFilter);
                            deleteQuery.execute(function(response) {
                                if (response.success) {
                                    this.deleteNotificationItem();
                                    this.decrementCommonNotificationsCount();
                                }
                            }, this);
                        },

                        /**
                         * Отменяет все уведомления. При этой операции удаляются все записи уведомлений текущего
                         * пользователя из базы данных
                         * @private
                         */
                        cancelAll: function() {
                            var notifications = this.get("Notifications");
                            if (notifications.isEmpty()) {
                                return;
                            }
                            var question =
                                Ext.String.format(resources.localizableStrings.CancelAllNotificationsQuestion);
                            Terrasoft.utils.showConfirmation(question, function(returnCode) {
                                if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
                                    var deleteQuery = Ext.create("Terrasoft.DeleteQuery", {
                                        rootSchemaName: "Reminding"
                                    });
                                    deleteQuery.filters = RemindingsUtilities.remindingFilters();
                                    deleteQuery.execute(function(response) {
                                        if (response.success) {
                                            sandbox.publish("UpdateRemindingsCount");
                                            notifications.clear();
                                            this.resetValues();
                                        }
                                    }, this);
                                }
                            }, ["yes", "no"], this, null);
                        },

                        /**
                         * Декорирует модель функциями
                         * @param {Object} item Элемент коллекции уведомлений
                         * @private
                         */
                        decorateItem: function(item) {
                            item.sandbox = sandbox;
                            item.cancel = this.cancel;
                            item.Terrasoft = Terrasoft;
                            item.parrentViewModel = this;
                            item.postpone = this.postpone;
                            item.getNotificationImage = this.getNotificationImage;
                            item.deleteNotificationItem = this.deleteNotificationItem;
                            item.getNotificationDateTime = this.getNotificationDateTime;
                            item.NotificationImagesConfig = scope.NotificationImagesConfig;
                            item.onNotificationSubjectClick = this.onNotificationSubjectClick;
                            item.getNotificationButtonCaption = this.getNotificationButtonCaption;
                            item.getNotificationSubjectCaption = this.getNotificationSubjectCaption;
                            item.updateNotificationItemRemindTime = this.updateNotificationItemRemindTime;
                            item.decrementCommonNotificationsCount = this.decrementCommonNotificationsCount;
                        },

                        /**
                         * Возвращает тип данных колонки
                         * @param {Object} record Элемент коллекции уведомлений
                         * @param {String} columnName Название колонки
                         * @returns {Object} Тип данных колонки
                         */
                        getDataValueType: function(record, columnName) {
                            var recordColumn = record.columns[columnName] ?
                                record.columns[columnName] :
                                record.entitySchema.columns[columnName];
                            return recordColumn ? recordColumn.dataValueType : null;
                        },

                        /**
                         * Инициализирует свойства постраничности EntitySchemaQuery
                         * @param {Terrasoft.EntitySchemaQuery} select Запрос по выборке уведомлений
                         * @param {Object} config Конфигурация запроса
                         * @private
                         */
                        initializePageableOptions: function(select, config) {
                            var isPageable = config.isPageable;
                            select.isPageable = isPageable;
                            var rowCount = config.rowCount;
                            var newLoadedCount = config.newLoadedCount ? config.newLoadedCount : 1;
                            select.rowCount = isPageable ? rowCount : -1;
                            if (!isPageable) {
                                return;
                            }
                            var collection = config.collection;
                            var primaryColumnName = config.primaryColumnName;
                            var schemaQueryColumns = config.schemaQueryColumns;
                            var isClearGridData = config.isClearGridData;
                            var conditionalValues = null;
                            var loadedRecordsCount = collection.getCount();
                            var isNextPageLoading = (loadedRecordsCount > 0 && !isClearGridData);
                            if (isNextPageLoading) {
                                var lastRecord = config.lastRecord ||
                                    collection.getByIndex(loadedRecordsCount - newLoadedCount);
                                var columnDataValueType = this.getDataValueType(lastRecord, primaryColumnName);
                                conditionalValues = Ext.create("Terrasoft.ColumnValues");
                                conditionalValues.setParameterValue(primaryColumnName,
                                    lastRecord.get(primaryColumnName), columnDataValueType);
                                schemaQueryColumns.eachKey(function(columnName, column) {
                                    var value = lastRecord.get(columnName);
                                    var dataValueType = this.getDataValueType(lastRecord, columnName);
                                    if (column.orderDirection !== Terrasoft.OrderDirection.NONE) {
                                        if (dataValueType === Terrasoft.DataValueType.LOOKUP) {
                                            value = value ? value.displayValue : null;
                                            dataValueType = Terrasoft.DataValueType.TEXT;
                                        }
                                        conditionalValues.setParameterValue(columnName, value, dataValueType);
                                    }
                                }, this);
                            }
                            select.conditionalValues = conditionalValues;
                        },

                        /**
                         * Догружает новую запись, или обновляет старую. Информирует подписчиков об необходимости
                         * перечитать количество уведомлений
                         * @protected
                         * @virtual
                         * @param {String} notificationId Уникальный идентификатор уведомления
                         */
                        loadNotification: function(notificationId) {
                            var notificationsCollection = this.get("Notifications");
                            if (notificationsCollection.contains(notificationId)) {
                                var notification = notificationsCollection.get(notificationId);
                                notification.loadEntity(notificationId);
                            } else {
                                var select = RemindingsUtilities.getRemindingSelect();
                                select.enablePrimaryColumnFilter(notificationId);
                                select.getEntityCollection(function(response) {
                                    if (response && response.success) {
                                        var itemsCollection = response.collection;
                                        itemsCollection.each(function(item) {
                                            this.decorateItem(item);
                                        }, this);
                                        notificationsCollection.loadAll(itemsCollection, {mode: "top"});
                                        sandbox.publish("UpdateRemindingsCount");
                                    }
                                }, this);
                            }
                        },

                        /**
                         * Удаляет запись из реестра уведомлений. Информирует подписчиков об необходимости
                         * перечитать количество уведомлений
                         * @protected
                         * @virtual
                         * @param {String} notificationId Уникальный идентификатор уведомления
                         */
                        removeNotification: function(notificationId) {
                            var notificationsCollection = this.get("Notifications");
                            if (notificationsCollection.contains(notificationId)) {
                                notificationsCollection.removeByKey(notificationId);
                                sandbox.publish("UpdateRemindingsCount");
                            }
                        },

                        /**
                         * Загружает уведомления в коллекцию Notifications
                         * @param {Boolean} isLoadNew Признак, который отвечает, что нужно произвести дозагрузку новых
                         * уведомлений
                         * @private
                         */
                        loadNotifications: function(isLoadNew) {
                            var notificationsCollection = this.get("Notifications");
                            if (isLoadNew) {
                                notificationsCollection.clear();
                            }
                            var select = RemindingsUtilities.getRemindingSelect();
                            var config = {
                                collection: this.get("Notifications"),
                                primaryColumnName: "Id",
                                schemaQueryColumns: select.columns,
                                isPageable: true,
                                rowCount: 15,
                                isClearGridData: false
                            };
                            this.initializePageableOptions(select, config);
                            select.getEntityCollection(function(response) {
                                if (response && response.success) {
                                    var itemsCollection = response.collection;
                                    itemsCollection.add("323213", Ext.create("Terrasoft.model.BaseViewModel",
                                        {
                                            entitySchema:Terrasoft.Reminding,
                                            values:{
                                                SubjectCaption: "Заказы и контакты с сайта",
                                                SubjectId: "a66d08e1-2e2d-e011-ac0a-00155d043205",
                                                SchemaName: "SxVwContactAndOrder",
                                                SysEntitySchema:{
                                                    displayValue: "Заказы и контакты с сайта"
                                                },
                                                RemindingTime:new Date()
                                            },
                                            columns: Terrasoft.Reminding.columns
                                        }), 0)
                                    itemsCollection.each(function(item) {
                                        this.decorateItem(item);
                                    }, this);
                                    notificationsCollection.loadAll(itemsCollection);
                                    sandbox.publish("UpdateRemindingsCount");
                                }
                            }, this);
                        },

                        /**
                         * Функция дозагрузки уведомлений
                         * @private
                         */
                        onLoadNext: function() {
                            this.loadNotifications(false);
                        },

                        /**
                         * Обновляет количество новых уведомлений на основании значений счетчиков,
                         * которые получены в результате выполнения задачи на сервере.
                         * @private
                         * @param {Object} scope Контекст
                         * @param {Object} userCounters Объект, который в себе содержит значения счетчиков
                         * количества уведомлений
                         */
                        onChangeNotifications: function(scope, userCounters) {
                            if (!userCounters) {
                                return;
                            }
                            var config;
                            switch (userCounters.Header.Sender) {
                                case "UpdateReminding":
                                    config = this.Ext.decode(userCounters.Body);
                                    this.updateReminding(config);
                                    break;
                                case "GetRemindingCounters":
                                    config = this.Ext.decode(userCounters.Body);
                                    this.setRemindingCounters(config);
                                    break;
                                default:
                                    break;
                            }
                        },

                        /**
                         * Обновляет список уведомлений согласно переданной конфигурации
                         * @protected
                         * @virtual
                         * @param {Object} config Конфигурация операции
                         */
                        updateReminding: function(config) {
                            switch (config.operation) {
                                case "update":
                                    this.loadNotification(config.recordId);
                                    break;
                                case "delete":
                                    this.removeNotification(config.recordId);
                                    break;
                                default:
                                    break;
                            }
                        },

                        /**
                         * Отображает кнопку загрузки новых записей
                         * @protected
                         * @virtual
                         * @param {Object} counters Конфигурация операции
                         */
                        setRemindingCounters: function(counters) {
                            var notificationsCount = counters.RemindingsCount;
                            var notifications = this.get("CommonNotificationsCount");
                            var newNotificationsCount = notifications - notificationsCount;
                            var notOpenedNotificationsCount = this.get("NotOpenedNotificationsCount");
                            this.set("NotOpenedNotificationsCount", notOpenedNotificationsCount +
                            newNotificationsCount * (-1));
                            var loadedNotificationsCount = this.get("Notifications").getCount();
                            if (notificationsCount > 0 && (newNotificationsCount < 0) &&
                                (notifications - loadedNotificationsCount) >= 0) {
                                this.set("NewNotificationsCount", this.get("NotOpenedNotificationsCount"));
                                var notificationsContainer = Ext.get("notificationItemsContainer");
                                if (notificationsContainer) {
                                    if (notificationsContainer.hasCls("default-notification-items-container-class")) {
                                        notificationsContainer.removeCls("default-notification-items-container-class");
                                        notificationsContainer.addCls("offset-notification-items-container-class");
                                    }
                                    this.set("ShowNewNotificationsVisible", true);
                                }
                            }
                            this.set("CommonNotificationsCount", counters.RemindingsCount);
                        },

                        /**
                         * Выполняет инициализацию модели представления
                         * @private
                         */
                        init: function() {
                            this.loadNotifications(false);
                            Terrasoft.ServerChannel.on(Terrasoft.EventName.ON_MESSAGE,
                                this.onChangeNotifications, this);
                            RemindingsUtilities.getRemindingsCounters(this, function(counters) {
                                this.set("CommonNotificationsCount", counters.remindingsCount);
                            });
                            var notificationItemsContainer = Ext.get("notificationItemsContainer");
                            notificationItemsContainer.on("click", scope.onNotificationClick, this);
                        }
                    }
                });
                viewModel.Ext = this.Ext;
                viewModel.Terrasoft = this.Terrasoft;
                viewModel.sandbox = this.sandbox;
                return viewModel;
            },

            /**
             * Обработчик события клика на контейнере уведомлений
             * @param {Ext.EventObject} event Событие
             * @param HTMLElement target Элемент на котором выполнен клик
             */
            onNotificationClick: function(event, target) {
                var targetEl = Ext.get(target);
                var root = Ext.get("notificationItemsContainer").dom;
                var notificationEl = targetEl.findParent("[class*=\"notification-container\"]", root, true);
                if (notificationEl && !notificationEl.hasCls("selected-item-class")) {
                    notificationEl.addCls("selected-item-class");
                }
                var lastSelectedRow = this.LastSelectedRow;
                if (lastSelectedRow && notificationEl && notificationEl.id !== lastSelectedRow.id) {
                    if (lastSelectedRow.hasCls("selected-item-class")) {
                        lastSelectedRow.removeCls("selected-item-class");
                    }
                }
                this.LastSelectedRow = notificationEl;
            },

            /**
             * Выполняет прорисовку модуля в контейнер
             * @private
             * @param {Ext.Element} renderTo
             */
            render: function(renderTo) {
                var view = this.getView();
                var viewModel = this.getViewModel();
                view.bind(viewModel);
                view.render(renderTo);
                viewModel.init();
            },

            /**
             * Деструктор класса
             * @private
             */
            destroy: function() {
                var notificationItemsContainer = Ext.get("notificationItemsContainer");
                if (notificationItemsContainer) {
                    notificationItemsContainer.un("click", this.onNotificationClick, this);
                }
            }
        });
        return Terrasoft.NotificationsModule;
    });