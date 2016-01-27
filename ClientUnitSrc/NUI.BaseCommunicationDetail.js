define("BaseCommunicationDetail", ["BaseCommunicationDetailResources", "terrasoft", "ViewUtilities",
	"ConfigurationConstants", "LookupUtilities", "BaseCommunicationViewModel",
	"ConfigurationItemGenerator", "BaseDetailV2"],
	function(resources, Terrasoft, ViewUtilities, ConfigurationConstants) {
		return {
			attributes: {
				/**
				 * Коллекция элементов меню кнопки "Добавить".
				 */
				ToolsMenuItems: {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Коллекция телефонов меню кнопки "Добавить".
				 */
				PhonesMenuItems: {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Коллекция соц. сетей меню кнопки "Добавить".
				 */
				SocialNetworksMenuItems: {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Коллекция элементов меню, которая содержит типы средства связи.
				 */
				MenuItems: {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Признак "данные загружены".
				 */
				IsDataLoaded: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Коллекция средств связи на удаление.
				 */
				DeletedItems: {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Колекция типов средств связи.
				 */
				"CommunicationTypes": {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.COLLECTION
				},

				/**
				 * Название класса модели представления.
				 */
				"BaseCommunicationViewModelClassName": {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.TEXT
				}
			},
			messages: {
				/**
				 * @message ResultSelectedRows
				 * Возвращает выбранные строки в справочнике.
				 */
				"ResultSelectedRows": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message UpdateCardProperty
				 * Устанавливает атрибуты страницы редактирования.
				 */
				"UpdateCardProperty": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message SetInitialisationData
				 * Устанавливает изначальные параметры поиска в социальных сетях.
				 */
				"SetInitialisationData": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message ValidateDetail
				 * Инициирует необходимость провалидировать значения детали.
				 */
				"ValidateDetail": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message DetailValidated
				 * Отправляет результат валидации детали.
				 */
				"DetailValidated": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message SaveDetail
				 * Инициирует сохранение детали.
				 */
				"SaveDetail": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message DetailValidated
				 * Отправляет результат сохранения.
				 */
				"DetailSaved": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message DiscardChanges
				 * Наступает при отмене изменений целевого объекта. Служит для обновления данных детали.
				 */
				"DiscardChanges": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message GetCommunicationsList
				 * Возвращает список средств связи.
				 */
				"GetCommunicationsList": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			methods: {
				/**
				 * Возвращает коллекцию пунктов меню для кнопки "Добавить".
				 * @protected
				 * @virtual
				 * @return {Terrasoft.BaseViewModelCollection} Коллекция пунктов меню.
				 */
				getToolsMenuItems: function() {
					var menuItems = this.Ext.create("Terrasoft.BaseViewModelCollection");
					var phonesMenuItems = this.Ext.create("Terrasoft.BaseViewModelCollection");
					var phonesMenuItem = this.Ext.create("Terrasoft.BaseViewModel", {
						values: {
							Caption: this.get("Resources.Strings.PhoneMenuItem"),
							Id: Terrasoft.utils.generateGUID(),
							Items: phonesMenuItems
						}
					});
					var socialNetworksMenuItems = this.Ext.create("Terrasoft.BaseViewModelCollection");
					var socialNetworksMenuItem = this.Ext.create("Terrasoft.BaseViewModel", {
						values: {
							Caption: this.get("Resources.Strings.SocialNetworksMenuItem"),
							Id: Terrasoft.utils.generateGUID(),
							Items: socialNetworksMenuItems
						}
					});
					var communicationTypes = this.get("CommunicationTypes");
					communicationTypes.each(function(item) {
						var menuItem = this.getButtonMenuItem(item);
						var typeId = item.get("CommunicationId");
						if (this.isPhoneType(typeId)) {
							this.addPhoneMenuItem(phonesMenuItems, menuItem);
							return;
						}
						if (this.isSocialNetworkType(typeId)) {
							this.addSocialNetworkMenuItem(socialNetworksMenuItems, menuItem);
							return;
						}
						menuItems.addItem(menuItem);
					}, this);
					this.addPhonesMenuItem(menuItems, phonesMenuItem);
					this.addSocialNetworksMenuItem(menuItems, socialNetworksMenuItem);
					return menuItems;
				},

				/**
				 * Добавляет в коллекцию пунктов меню пункт с подменю.
				 * @private
				 * @param {Object} menuItems Коллекция пунктов меню.
				 * @param {Object} subMenuItem Пункт с подменю.
				 */
				addSubMenuItem: function(menuItems, subMenuItem) {
					if (!subMenuItem) {
						return;
					}
					var subMenuItems = subMenuItem.get("Items");
					if (subMenuItems.isEmpty()) {
						return;
					}
					menuItems.addItem(subMenuItem);
				},

				/**
				 * Добавляет в коллекцию пунктов меню пункт с подменю коллекцией типов телефонов.
				 * @protected
				 * @virtual
				 * @param {Object} menuItems Коллекция пунктов меню.
				 * @param {Object} phonesMenuItem Пункт с подменю коллекцией типов телефонов.
				 */
				addPhonesMenuItem: function(menuItems, phonesMenuItem) {
					this.addSubMenuItem(menuItems, phonesMenuItem);
				},

				/**
				 * Добавляет в коллекцию пунктов меню пункт с подменю коллекцией типов социальных сетей.
				 * @protected
				 * @virtual
				 * @param {Object} menuItems Коллекция пунктов меню.
				 * @param {Object} socialNetworksMenuItem Пункт с подменю коллекцией типов социальных сетей.
				 */
				addSocialNetworksMenuItem: function(menuItems, socialNetworksMenuItem) {
					this.addSubMenuItem(menuItems, socialNetworksMenuItem);
				},

				/**
				 * Проверяет является ли тип средства связи одним из типов телефон.
				 * @private
				 * @param {String} communicationType Значение типа элемента.
				 * @return {Boolean} возвращает признак соответсвия типа средства связи.
				 */
				isPhoneType: function(communicationType) {
					communicationType = communicationType.value || communicationType;
					return (communicationType === ConfigurationConstants.Communication.Phone);
				},

				/**
				 * Проверяет является ли тип средства связи одним из типов соц. сетей.
				 * @private
				 * @param {String} communicationType Значение типа элемента.
				 * @return {Boolean} возвращает признак соответсвия типа средства связи.
				 */
				isSocialNetworkType: function(communicationType) {
					communicationType = communicationType.value || communicationType;
					return (communicationType === ConfigurationConstants.Communication.SocialNetwork);
				},

				/**
				 * Добавляет пункт в подменю Телефоны.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.BaseViewModelCollection} phonesMenuItems Коллекция пунктов для подменю Телефоны.
				 * @param {Terrasoft.BaseViewModel} menuItem Пункт подменю.
				 */
				addPhoneMenuItem: function(phonesMenuItems, menuItem) {
					phonesMenuItems.addItem(menuItem);
				},

				/**
				 * Добавляет пункт в подменю Социальные сети.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.BaseViewModelCollection} socialNetworksMenuItems Коллекция пунктов для подменю Социальные сети.
				 * @param {Terrasoft.BaseViewModel} menuItem Пункт подменю.
				 */
				addSocialNetworkMenuItem: function(socialNetworksMenuItems, menuItem) {
					socialNetworksMenuItems.addItem(menuItem);
				},

				/**
				 * Возвращает пункт меню для кнопки детали "Добавить" на основании полученного типа средства связи.
				 * @protected
				 * @param {Terrasoft.BaseViewModel} item Элемент коллекции типов средств связи.
				 * @return {Terrasoft.BaseViewModel} Модель представления пункта меню.
				 */
				getButtonMenuItem: function(item) {
					var name = item.get("Name");
					var value = item.get("Id");
					return Ext.create("Terrasoft.BaseViewModel", {
						values: {
							Id: value,
							Caption: name,
							Tag: value,
							Click: {bindTo: "addItem"}
						}
					});
				},

				/**
				 * Формирует конфигурацию представления элемента средства связи.
				 * @protected
				 * @virtual
				 * @param {Object} itemConfig Ссылка на конфигурацию элемента в ContainerList.
				 */
				getItemViewConfig: function(itemConfig) {
					var itemViewConfig = this.get("itemViewConfig");
					if (itemViewConfig) {
						itemConfig.config = itemViewConfig;
						return;
					}
					var config = this.getCommunicationItemViewConfig();
					itemConfig.config = config;
					this.set("itemViewConfig", config);
				},

				/**
				 * Возвращает конфигурацию представления элемента средства связи.
				 * @protected
				 * @virtual
				 * @return {Object} Конфигурация представления элемента средства связи.
				 */
				getCommunicationItemViewConfig: function() {
					var itemViewConfig = ViewUtilities.getContainerConfig("item-view",
							["detail-edit-container-user-class", "control-width-15"]);
					var typeMenuItems = this.getTypeMenuItems();
					var typeButtonConfig = this.getTypeButtonConfig(typeMenuItems);
					var iconTypeButtonConfig = this.getIconTypeButtonConfig();
					var textEditConfig = this.getTextEditConfig();
					itemViewConfig.items.push(typeButtonConfig, textEditConfig, iconTypeButtonConfig);
					return itemViewConfig;
				},

				/**
				 * Возвращает пункты меню для кнопки выбора типа средства связи.
				 * @protected
				 * @return {Array} Пункты меню для кнопки выбора типа средства связи.
				 */
				getTypeMenuItems: function() {
					var typeMenuItems = [];
					var communicationTypes = this.get("CommunicationTypes");
					communicationTypes.each(function(communicationType) {
						this.addMenuItem(typeMenuItems, communicationType);
					}, this);
					typeMenuItems.push({
						className: "Terrasoft.MenuSeparator"
					});
					this.addDeleteMenuItem(typeMenuItems);
					return typeMenuItems;
				},

				/**
				 * Добавляет пункт для типа средства связи в меню кнопки выбора типа средства связи.
				 * @protected
				 * @param {Array} typeMenuItems Пункты меню для кнопки выбора типа средства связи.
				 * @param {Object} communicationType Тип средства связи.
				 */
				addMenuItem: function(typeMenuItems, communicationType) {
					var name = communicationType.get("Name");
					var value = communicationType.get("Id");
					typeMenuItems.push({
						caption: name,
						tag: value,
						click: {bindTo: "typeChanged"},
						visible: {
							bindTo: "getMenuItemVisibility"
						}
					});
				},

				/**
				 * Добавляет пункт "Удалить" в меню для кнопки выбора типа средства связи.
				 * @protected
				 * @param {Array} typeMenuItems Пункты меню для кнопки выбора типа средства связи.
				 */
				addDeleteMenuItem: function(typeMenuItems) {
					typeMenuItems.push({
						caption: this.get("Resources.Strings.DeleteMenuItemCaption"),
						imageConfig: this.get("Resources.Images.DeleteIcon"),
						tag: "delete",
						click: {bindTo: "deleteItem"}
					});
				},

				/**
				 * Возвращает конфигурацию кнопки выбора типа средства связи.
				 * @protected
				 * @param {Array} typeMenuItems Пункты меню для кнопки выбора типа средства связи.
				 * @return {Object} Конфигурация кнопки выбора типа средства связи.
				 */
				getTypeButtonConfig: function(typeMenuItems) {
					var typeButtonConfig = {
						className: "Terrasoft.Button",
						classes: {
							wrapperClass: ["label-wrap", "detail-type-btn-user-class"],
							textClass: ["detail-type-btn-inner-user-class"]
						},
						style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						selectors: {wrapEl: "#type"},
						caption: {
							bindTo: "CommunicationType",
							bindConfig: {converter: "getTypeButtonCaption"}
						},
						menu: {items: typeMenuItems}
					};
					return typeButtonConfig;
				},

				/**
				 * Возвращает конфигурацию иконки средства связи.
				 * @protected
				 * @return {Object} Конфигурация иконки средства связи.
				 */
				getIconTypeButtonConfig: function() {
					var iconTypeButtonConfig = {
						className: "Terrasoft.Button",
						classes: {
							wrapperClass: "detail-icon-type-btn-user-class"
						},
						imageConfig: {
							bindTo: "getTypeImageConfig"
						},
						style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						selectors: {wrapEl: "#iconType"},
						click: {
							bindTo: "onTypeIconButtonClick"
						},
						visible: {
							bindTo: "getTypeIconButtonVisibility"
						},
						hint: {
							bindTo: "getTypeIconButtonHintText"
						},
						markerValue: {
							bindTo: "getIconTypeButtonMarkerValue"
						}
					};
					return iconTypeButtonConfig;
				},

				/**
				 * Возвращает конфигурацию поля для ввода средства связи.
				 * @protected
				 * @return {Object} Конфигурация поля для ввода средства связи.
				 */
				getTextEditConfig: function() {
					var editConfig = {
						className: "Terrasoft.TextEdit",
						classes: {wrapClass: ["communication-lookup-img-user-class", "detail-edit-user-class"]},
						value: {
							bindTo: "Number",
							bindConfig: {converter: "updateLinkUrl"}
						},
						showValueAsLink: true,
						href: {bindTo: "Link"},
						linkclick: {bindTo: "onLinkClick"},
						hasClearIcon: true,
						enabled: {bindTo: "getCommunicationEnabled"},
						enableRightIcon: {bindTo: "getRightIconEnabled"},
						rightIconClick: {bindTo: "onLookUpClick"},
						markerValue: {
							bindTo: "CommunicationType",
							bindConfig: {converter: "getTypeButtonCaption"}
						}
					};
					return editConfig;
				},

				/**
				 * Инициализирует фильтры запроса средств связи.
				 * @protected
				 * @virtual
				 * @param {Object} esq Запрос данных о средствах связи, в который добавляется фильтр.
				 */
				initCommunicationTypesFilters: function(esq) {
					var detailColumnName = this.get("DetailColumnName");
					esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL,
						"Usefor" + detailColumnName + "s",
						true));
					esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.NOT_EQUAL,
						"[ComTypebyCommunication:CommunicationType:Id].Communication",
						ConfigurationConstants.Communication.SMS));
				},

				/**
				 * Загружает средства связи.
				 * @protected
				 * @virtual
				 * @param {Function} callback callback-функция.
				 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения callback-функции.
				 */
				loadContainerListData: function(callback, scope) {
					if (this.get("IsDetailCollapsed")) {
						callback.call(scope);
						return;
					}
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchema: this.entitySchema,
						rowViewModelClassName: this.get("BaseCommunicationViewModelClassName")
					});
					this.initQueryColumns(esq);
					this.initQueryFilters(esq);
					this.initQueryEvents(esq);
					esq.getEntityCollection(function(response) {
						this.destroyQueryEvents(esq);
						this.onContainerListDataLoaded(response);
						callback.call(scope);
					}, this);
				},

				/**
				 * Инициализирует колонки экземпляра запроса.
				 * @protected
				 * @param {Object} esq Запрос, в котором будут проинициализированы колонки.
				 */
				initQueryColumns: function(esq) {
					esq.addColumn(this.primaryDisplayColumnName);
					var detailColumnName = this.get("DetailColumnName");
					var createdOnColumn = esq.addColumn("CreatedOn");
					createdOnColumn.orderDirection = Terrasoft.OrderDirection.ASC;
					esq.addColumn("Id");
					esq.addColumn("CommunicationType");
					esq.addColumn("Position");
					esq.addColumn("SocialMediaId");
					esq.addColumn("SearchNumber");
					esq.addColumn(detailColumnName);
				},

				/**
				 * Инициализирует фильтры запроса данных о средствах связи.
				 * @protected
				 * @param {Object} esq Запрос данных о средствах связи.
				 */
				initQueryFilters: function(esq) {
					var detailColumnName = this.get("DetailColumnName");
					esq.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							"[CommunicationType:Id:CommunicationType].Usefor" + detailColumnName + "s", true));
					esq.filters.addItem(this.get("Filter"));
				},

				/**
				 * Инициализирует события запроса данных о средствах связи.
				 * @protected
				 * @param {Object} esq Запрос данных о средствах связи.
				 */
				initQueryEvents: function(esq) {
					esq.on("createviewmodel", this.createViewModel, this);
				},

				/**
				 * Отписывает запрос данных о средствах связи от событий.
				 * @protected
				 * @param {Object} esq Запрос данных о средствах связи.
				 */
				destroyQueryEvents: function(esq) {
					esq.un("createviewmodel", this.createViewModel, this);
				},

				/**
				 * Инициализирует экземляр модели представления по результатам запроса.
				 * @private
				 * @param {Object} config Конфигурация для создания модели представления.
				 * @param {Object} config.rawData Значения колонок.
				 * @param {Object} config.rowConfig Типы колонок.
				 * @param {Object} config.viewModel Модель представления.
				 */
				createViewModel: function(config) {
					var communicationTypeId = config.rawData.CommunicationType.value;
					var communicationViewModelClassName = this.getCommunicationViewModelClassName(communicationTypeId);
					var communicationViewModelConfig = this.getCommunicationViewModelConfig(config);
					var viewModel = this.Ext.create(communicationViewModelClassName, communicationViewModelConfig);
					config.viewModel = viewModel;
				},

				/**
				 * Возвращает класс для создания модели представления средства связи.
				 * @protected
				 * @virtual
				 * @return {String} Класс для создания модели представления средства связи.
				 */
				getCommunicationViewModelClassName: function() {
					return this.get("BaseCommunicationViewModelClassName");
				},

				/**
				 * Возвращает конфигурацию для создания модели представления средства связи.
				 * @protected
				 * @param {Object} config Конфигурация для создания модели представления.
				 * @param {Object} config.rawData Значения колонок.
				 * @param {Object} config.rowConfig Типы колонок.
				 * @return {Object} Конфигурация для создания модели представления средства связи.
				 */
				getCommunicationViewModelConfig: function(config) {
					return {
						entitySchema: this.entitySchema,
						rowConfig: config.rowConfig,
						values: config.rawData,
						isNew: false,
						isDeleted: false
					};
				},

				/**
				 * Событие загрузки данных. Выполняется, когда сервер возвращает данные.
				 * @protected
				 * @virtual
				 * @param {Object} response Ответ от сервера.
				 * @param {Boolean} response.success Статус ответа от сервера.
				 * @param {Terrasoft.Collection} response.collection Коллекция сущностей.
				 */
				onContainerListDataLoaded: function(response) {
					if (response.success) {
						var collection = this.get("Collection");
						collection.clear();
						var detailColumnName = this.get("DetailColumnName");
						var entityCollection = response.collection;
						var communicationTypes = this.get("CommunicationTypes");
						var phoneCommunicationTypes = this.get("PhoneCommunicationTypes");
						entityCollection.each(function(item) {
							item.columns = this.columns;
							item.sandbox = this.sandbox;// todo: хак для ContainerList
							item.set("CommunicationTypes", communicationTypes);
							item.set("DetailColumnName", detailColumnName);
							item.set("PhoneCommunicationTypes", phoneCommunicationTypes);
							item.updateLinkUrl(item.get("Number"));
							this.addColumnValidator("Number", item.validateField, item);
						}, this);
						collection.loadAll(entityCollection);
						this.set("IsDataLoaded", true);
					}
				},

				/**
				 * Добавляет валидатор для указанной колонки.
				 * @protected
				 * @virtual
				 * @param {String} columnName Имя колонки для валидации.
				 * @param {Function} validatorFn Функция валидации.
				 * @param {Object} sender Элемент валидации.
				 */
				addColumnValidator: function(columnName, validatorFn, sender) {
					var columnValidationConfig = sender.validationConfig[columnName] ||
						(sender.validationConfig[columnName] = []);
					columnValidationConfig.push(validatorFn);
				},

				/**
				 * Устанавливает видимость кнопок "Сохранить" и "Отмена" страницы на которой размещена деталь.
				 * @protected
				 * @param {Boolean} isVisible Если истина кнопки "Сохранить" и "Отмена" страницы отображаются.
				 */
				setSaveDiscardButtonsVisible: function(isVisible) {
					var options = ["ShowSaveButton", "ShowDiscardButton"];
					Terrasoft.each(options, function(option) {
						this.updateCardProperty(option, isVisible, null);
					}, this);
					this.updateCardProperty("IsChanged", isVisible, {silent: true});
					this.updateCardProperty("Restored", true, {silent: true});
				},

				/**
				 * Устанавливает свойство страницы на которой размещена деталь.
				 * @protected
				 * @param {String} key Наименование свойства.
				 * @param {String} value Значение свойства.
				 * @param {Object} options Дополнительные свойства.
				 */
				updateCardProperty: function(key, value, options) {
					this.sandbox.publish("UpdateCardProperty", {
						key: key,
						value: value,
						options: options
					}, [this.sandbox.id]);
				},

				/**
				 * Отображает кнопки "Сохранить" и "Отмена" страницы на которой размещена деталь.
				 * @protected
				 * @param {Boolean} isVisible Если истина кнопки "Сохранить" и "Отмена" страницы отображаются.
				 */
				changeCardPageButtonsVisibility: function(isVisible) {
					this.setSaveDiscardButtonsVisible(isVisible);
				},

				/**
				 * Обработчик изменения средства связи.
				 * @protected
				 * @param {Terrasoft.BaseViewModel} item Измененный элемент.
				 * @param {Object} config Свойства операции изменения элемента.
				 */
				onItemChanged: function(item, config) {
					if (config && config.OperationType === "Delete") {
						this.deleteItem(item);
					}
					this.changeCardPageButtonsVisibility(true);
				},

				/**
				 * Удаляет средство связи из основной коллекции детали и помещает его в коллекцию элементов на удаление.
				 * @protected
				 * @param {Terrasoft.BaseViewModel} item Удаленный элемент средства связи.
				 */
				deleteItem: function(item) {
					var deletedItems = this.get("DeletedItems");
					var collection = this.get("Collection");
					collection.removeByKey(item.get("Id"));
					deletedItems.addItem(item);
				},

				/**
				 * Добавляет средство связи на деталь.
				 * @protected
				 * @param {String} communicationTypeId Идентификатор средства связи.
				 */
				addItem: function(communicationTypeId) {
					if (this.get("IsDetailCollapsed")) {
						return;
					}
					var communicationTypes = this.get("CommunicationTypes");
					var phoneCommunicationTypes = this.get("PhoneCommunicationTypes");
					if (communicationTypeId) {
						var communicationType = communicationTypes.get(communicationTypeId);
					}
					var itemClassName = this.getCommunicationViewModelClassName(communicationTypeId);
					var newItem = this.Ext.create(itemClassName, {
						entitySchema: this.entitySchema,
						columns: this.columns
					});
					var detailColumnName = this.get("DetailColumnName");
					newItem.set("CommunicationTypes", communicationTypes);
					newItem.set("DetailColumnName", detailColumnName);
					newItem.set("PhoneCommunicationTypes", phoneCommunicationTypes);
					this.addColumnValidator("Number", newItem.validateField, newItem);
					newItem.sandbox = this.sandbox;
					newItem.setDefaultValues(function() {
						var communicationTypeConfig = null;
						if (communicationType) {
							communicationTypeConfig = {
								value: communicationType.get("Id"),
								displayValue: communicationType.get("Name")
							};
						}
						newItem.set("CommunicationType", communicationTypeConfig);
						newItem.set(detailColumnName, {
							value: this.get("MasterRecordId")
						});
						var itemKey = newItem.get("Id");
						var collection = this.get("Collection");
						collection.add(itemKey, newItem);
						this.changeCardPageButtonsVisibility(true);
					}, this);
					return newItem;
				},

				/**
				 * Выполняет загрузку данных детали.
				 * @protected
				 * @virtual
				 * @param {Function} callback callback-функция.
				 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения callback-функции.
				 */
				loadData: function(callback, scope) {
					this.initCommunicationTypes(function() {
						this.initPhoneCommunicationTypes();
						this.initToolsMenuItems();
						this.loadContainerListData(callback, scope);
					});
				},

				/**
				 * Инициализирует коллекцию пунктов меню кнопки Добавить.
				 */
				initToolsMenuItems: function() {
					var toolsMenuItems = this.getToolsMenuItems();
					var menuItems = this.get("ToolsMenuItems");
					menuItems.clear();
					menuItems.loadAll(toolsMenuItems);
				},

				/**
				 * Инициализирует коллекции детали.
				 * @protected
				 * @virtual
				 */
				initCollections: function() {
					var collection = this.get("Collection");
					collection.on("itemChanged", this.onItemChanged, this);
					this.set("ToolsMenuItems", this.Ext.create("Terrasoft.BaseViewModelCollection"));
					this.set("DeletedItems",
						this.Ext.create("Terrasoft.BaseViewModelCollection", {entitySchema: this.entitySchema}));
				},

				/**
				 * Инициализирует коллекцию типов средств связи с типом коммуникации "Телефон".
				 * @protected
				 */
				initPhoneCommunicationTypes: function() {
					var communicationTypes = this.get("CommunicationTypes");
					var phoneCommunicationTypes = communicationTypes.filter(function(item) {
						var communicationId = item.get("CommunicationId");
						return (communicationId.value === ConfigurationConstants.Communication.Phone);
					});
					var phoneCommunicationTypeIds = [];
					phoneCommunicationTypes.each(function(item) {
						var primaryColumnValue = item.get("Id");
						phoneCommunicationTypeIds.push(primaryColumnValue)
					});
					this.set("PhoneCommunicationTypes", phoneCommunicationTypeIds);
				},

				/**
				 * Инициализирует коллекцию типов средств связи.
				 * @protected
				 * @param {Function} callback Функция обратного вызова.
				 */
				initCommunicationTypes: function(callback) {
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "CommunicationType"
					});
					esq.addMacrosColumn(this.Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
					esq.addMacrosColumn(this.Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "Name");
					esq.addColumn("[ComTypebyCommunication:CommunicationType:Id].Communication", "CommunicationId");
					this.initCommunicationTypesFilters(esq);
					esq.getEntityCollection(function(response) {
						if (response.success) {
							var entityCollection = response.collection;
							this.set("CommunicationTypes", entityCollection);
						}
						callback.call(this);
					}, this);
				},

				/**
				 * Подписывает на сообщения.
				 * @protected
				 * @virtual
				 */
				subscribeSandboxEvents: function() {
					this.callParent(arguments);
					this.sandbox.subscribe("ResultSelectedRows", this.save, this, [this.sandbox.id]);
					this.sandbox.subscribe("ValidateDetail", this.validateDetail, this, [this.sandbox.id]);
					this.sandbox.subscribe("SaveDetail", this.save, this, [this.sandbox.id]);
					this.sandbox.subscribe("DiscardChanges", this.onDiscardChanges, this, [this.sandbox.id]);
					this.sandbox.subscribe("GetCommunicationsList", this.onGetCommunications, this, [this.sandbox.id]);
				},

				/**
				 * Выполняет перезагрузку детали при отмене изменений в карточке.
				 * @protected
				 */
				onDiscardChanges: function() {
					this.updateDetail();
				},

				/**
				 * Выполняет валидацию детали.
				 * @protected
				 * @virtual
				 * @return {Boolean} true если деталь прошла валидацию.
				 */
				validateDetail: function() {
					var invalidItems = this.getInvalidItems();
					var resultObject = {
						success: (invalidItems.length <= 0)
					};
					if (!resultObject.success) {
						var invalidCommunicationInfo = invalidItems[0];
						var validationMessage = this.getValidationMessage(invalidCommunicationInfo);
						resultObject.message = validationMessage;
					}
					this.sandbox.publish("DetailValidated", resultObject, [this.sandbox.id]);
					return true;
				},

				/**
				 * Возвращает сообщение о невалидном средстве связи.
				 * @protected
				 * @param {Object} invalidCommunicationInfo Информация о невалидном средстве связи.
				 */
				getValidationMessage: function(invalidCommunicationInfo) {
					var invalidColumnName = invalidCommunicationInfo.invalidColumn.name;
					var invalidCommunicationNumber = invalidCommunicationInfo.communication.get("Number");
					var invalidCommunicationType = invalidCommunicationInfo.communication.get("CommunicationType");
					var invalidCommunicationTypeName = "";
					if (invalidCommunicationType) {
						invalidCommunicationTypeName = invalidCommunicationType.displayValue;
					}
					var resourceName = "Resources.Strings." + invalidColumnName + "ValidationErrorTemplate";
					var messageTemplate = this.get(resourceName);
					return this.Ext.String.format(messageTemplate,
							invalidCommunicationNumber, invalidCommunicationTypeName);
				},

				/**
				 * Формирует сообщение о ошибке.
				 * @protected
				 * @param {String} message Сообщение.
				 * @return {String} Строка сообщения о ошибке.
				 */
				getErrorMessage: function(message) {
					var messageTemplate = this.get("Resources.Strings.ErrorTemplate");
					return this.Ext.String.format(messageTemplate,
						this.get("Resources.Strings.DetailCaption") + (message ? ":" + message : ""));
				},

				/**
				 * Инцициализация детали.
				 * @protected
				 * @virtual
				 * @param {Function} callback callback-функция.
				 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения callback-функции.
				 */
				init: function(callback, scope) {
					this.callParent([function() {
						this.initCollections();
						if (this.Ext.isEmpty(this.get("BaseCommunicationViewModelClassName"))) {
							this.set("BaseCommunicationViewModelClassName", "Terrasoft.BaseCommunicationViewModel");
						}
						this.loadData(callback, scope);
					}, this]);
				},

				/**
				 * Обработчик развертывания и свертывания детали.
				 * @protected
				 * @param {Boolean} isCollapsed Свернута ли деталь.
				 */
				onDetailCollapsedChanged: function(isCollapsed) {
					this.callParent(arguments);
					this.set("IsDetailCollapsed", isCollapsed);
					if (!isCollapsed && !this.get("IsDataLoaded")) {
						this.loadContainerListData(this.Terrasoft.emptyFn);
					}
				},

				/**
				 * Обновляет деталь при переходе на новую строку в вертикальном реестре.
				 * @protected
				 */
				updateDetail: function() {
					var detailInfo = this.sandbox.publish("GetDetailInfo", null, [this.sandbox.id]) || {};
					this.set("MasterRecordId", detailInfo.masterRecordId);
					this.set("DetailColumnName", detailInfo.detailColumnName);
					this.set("Filter", detailInfo.filter);
					this.set("CardPageName", detailInfo.cardPageName);
					this.set("SchemaName", detailInfo.schemaName);
					this.set("DefaultValues", detailInfo.defaultValues);
					this.set("IsDataLoaded", false);
					this.loadContainerListData(function() {
						var deletedItems = this.get("DeletedItems");
						deletedItems.clear();
						this.setSaveDiscardButtonsVisible(false);
					}, this);
				},
				/**
				 * Формирует массив запросов на удаление средств связи.
				 * @protected
				 * @return {Array} Массив запросов на удаление.
				 */
				getDeleteItemsQueries: function() {
					var deletedItems = this.get("DeletedItems");
					var deleteQueries = [];
					deletedItems.each(function(item) {
						var primaryColumnValue = item.get(item.primaryColumnName);
						var deleteQuery = item.getDeleteQuery();
						deleteQuery.enablePrimaryColumnFilter(primaryColumnValue);
						deleteQueries.push(deleteQuery);
					}, this);
					return deleteQueries;
				},

				/**
				 * Формирует массив запросов на изменение/добавление средства связи.
				 * @protected
				 * @return {Array} Массив запросов на изменение/добавление средства связи.
				 */
				getSaveItemsQueries: function() {
					var collection = this.get("Collection");
					var saveQueries = [];
					collection.each(function(item) {
						if (item.isChanged() && item.validate()) {
							saveQueries.push(item.getSaveQuery());
						}
					}, this);
					return saveQueries;
				},

				/**
				 * Возвращает массив средств связи, которые не прошли валидацию.
				 * @protected
				 * @return {Array} Массив средств связи, которые не прошли валидацию.
				 */
				getInvalidItems: function() {
					var communications = this.getItemsToValidate();
					var invalidCommunications = [];
					var validationResult;
					communications.each(function(communication) {
						validationResult = this.getCommunicationValidationResult(communication);
						if (!validationResult.success) {
							invalidCommunications.push(validationResult);
							return false;
						}
					}, this);
					return invalidCommunications;
				},

				/**
				 * Возвращает элементы детали подлежащие валидации.
				 * @protected
				 * @virtual
				 * @return {Terrasoft.Collection} Элементы детали подлежащие валидации.
				 */
				getItemsToValidate: function() {
					return this.get("Collection");
				},

				/**
				 * Возвращает результат валидации средства связи.
				 * @private
				 * @param {Terrasoft.BaseCommunicationViewModel} communication Средство связи.
				 * @return {Object} Результат валидации средства связи.
				 */
				getCommunicationValidationResult: function(communication) {
					var validationResult = {
						success: true
					};
					if (communication.isChanged() && !communication.validate()) {
						var attributes = communication.validationInfo.attributes;
						Terrasoft.each(attributes, function(attribute, attributeName) {
							if (!attribute.isValid) {
								var invalidColumn = communication.columns[attributeName];
								validationResult = {
									success: false,
									invalidColumn: invalidColumn,
									communication: communication
								};
								return false;
							}
						}, this);
					}
					return validationResult;
				},

				/**
				 * Сохраняет изменения детали. Срабатывает при нажатии на кнопку сохранить карточки, которая содержит
				 * деталь.
				 * @protected
				 * @return {Boolean} True если сохранение прошло успешно, или нет изменений для сохранения.
				 */
				save: function() {
					var queries = [];
					var saveQueries = this.getSaveItemsQueries();
					queries = queries.concat(saveQueries);
					var deleteQueries = this.getDeleteItemsQueries();
					queries = queries.concat(deleteQueries);
					if (Ext.isEmpty(queries)) {
						this.publishSaveResponse({
							success: true
						});
						return true;
					}
					var batchQuery = Ext.create("Terrasoft.BatchQuery");
					Terrasoft.each(queries, function(query) {
						batchQuery.add(query);
					}, this);
					batchQuery.execute(this.onSaved, this);
					return true;
				},

				/**
				 * Обработчик события "после сохранения детали".
				 * Если сохранение прошло успешно, устанавливает состояние данных коллекции в исходное состояние.
				 * Если сохранение прошло не успешно, публикует негативный ответ и сообщение о некорректной валидации.
				 * @protected
				 * @param {Object} response Содержит ответ с результатом сохранения.
				 */
				onSaved: function(response) {
					var message = response.ResponseStatus && response.ResponseStatus.Message;
					if (response.success && !message) {
						var deletedItems = this.get("DeletedItems");
						var collection = this.get("Collection");
						collection.each(function(item) {
							item.isNew = false;
							item.changedValues = null;
						}, this);
						deletedItems.clear();
						this.publishSaveResponse(response);
					} else {
						this.publishSaveResponse({
							success: false,
							message: this.getErrorMessage(message)
						});
					}
				},

				/**
				 * Публикует сообщение о том что деталь сохранена.
				 * @protected
				 * @param {Object} config Параметры сообщения.
				 */
				publishSaveResponse: function(config) {
					this.sandbox.publish("DetailSaved", config, [this.sandbox.id]);
				},

				/**
				 * @inheritDoc Terrasoft.BaseDetailV2#getProfileKey
				 */
				getProfileKey: function() {
					return this.get("CardPageName") + this.get("SchemaName");
				},

				/**
				 * Возвращает массив средств связи.
				 * @return {Array|*} Массив средств связи.
				 */
				onGetCommunications: function() {
					var invalidItems = this.getInvalidItems();
					if (invalidItems.length > 0) {
						return null;
					}
					var result = [];
					var collection = this.get("Collection");
					collection.each(function(item) {
						result.push({
							"Id": item.get("Id"),
							"Number": item.get("Number"),
							"SearchNumber": item.get("SearchNumber"),
							"CommunicationType": item.get("CommunicationType")
						});
					}, this);
					return result;
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "Detail",
					"values": {
						"caption": {"bindTo": "Resources.Strings.DetailCaption"}
					}
				},
				{
					"operation": "insert",
					"name": "CommunicationsContainer",
					"parentName": "Detail",
					"propertyName": "items",
					"values":
					{
						"generator": "ConfigurationItemGenerator.generateContainerList",
						"idProperty": "Id",
						"collection": "Collection",
						"observableRowNumber": 10,
						"onGetItemConfig": "getItemViewConfig"
					}
				},
				{
					"operation": "insert",
					"name": "AddButton",
					"parentName": "Detail",
					"propertyName": "tools",
					"values": {
						"visible": {"bindTo": "getToolsVisible"},
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"controlConfig": {
							"menu": {
								"items": {"bindTo": "ToolsMenuItems"}
							}
						},
						"caption": {"bindTo": "Resources.Strings.AddButtonCaption"},
						"markerValue": "AddRecordButton"
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
