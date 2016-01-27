define("SysLogoSettingsModule", ["SysLogoSettingsModuleResources", "MaskHelper", "SecurityUtilities", "BaseModule",
		"ContextHelpMixin"],
	function(resources, maskHelper, SecurityUtilities) {

		/**
		 * @class Terrasoft.SysLogoSettingsModule
		 * Класс модуля редактирования системных настроек корпоративной символики приложения.
		 */
		return Ext.define("Terrasoft.configuration.SysLogoSettingsModule", {
			extend: "Terrasoft.BaseModule",
			alternateClassName: "Terrasoft.SysLogoSettingsModule",
			mixins: {
				SecurityUtilitiesMixin: "Terrasoft.SecurityUtilitiesMixin",

				/**
				 * @class ContextHelpMixin Реализует возможность работы с модулем открытия справки.
				 */
				ContextHelpMixin: "Terrasoft.ContextHelpMixin"
			},

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Признак того, что модуль инциализируется асинхронно.
			 * @private
			 * @type {Boolean}
			 */
			isAsync: true,

			/**
			 * Объект мета-информации системных настроек. Где имя свойства - это код системной настройки, а значение -
			 * меиа информация (код, заголовок, значение).
			 * @private
			 * @type {Object}
			 */
			logoSysSettingsCfg: null,

			/**
			 * Инициализация состояние и загружает значения системных настроек с корпоративной символикой приложения,
			 * после чего, создает модель представления модуля.
			 * @param {Function} callback Функция, которая будет вызвана по завершению
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback
			 * @virtual
			 */
			init: function(callback, scope) {
				this.callParent(arguments);
				this.checkAvailability(function() {
					var localizableStrings = resources.localizableStrings;
					var headerCaption = localizableStrings.HeaderCaption;
					this.sandbox.publish("ChangeHeaderCaption", {
						isMainMenu: false,
						caption: headerCaption,
						dataViews: this.Ext.create("Terrasoft.Collection")
					});
					this.sandbox.subscribe("NeedHeaderCaption", function() {
						this.sandbox.publish("InitDataViews", {
							isMainMenu: false,
							caption: headerCaption,
							dataViews: this.Ext.create("Terrasoft.Collection")
						});
					}, this);
					this.initHistoryState();
					this.initContextHelp();
					var logoSysSettingsNames = [
						"LogoImage",
						"MenuLogoImage",
						"HeaderLogoImage"
					];
					this.logoSysSettingsCfg = {};
					this.Terrasoft.SysSettings.querySysSettings(logoSysSettingsNames, function(sysSettings) {
						this.Terrasoft.each(sysSettings, function(sysSettingValue, sysSettingName) {
							this.logoSysSettingsCfg[sysSettingName] = {
								code: sysSettingName,
								value: sysSettingValue,
								caption: localizableStrings[sysSettingName + "Caption"] || sysSettingName
							};
						}, this);
						this.viewModel = this.createViewModel();
						callback.call(scope);
					}, this);
				});
			},

			/**
			 * Возвращает Название операции доступ на которую должен быть у пользователя для использования раздела или
			 * страницы
			 * @protected
			 * @virtual
			 * @return {String|null} Название операции.
			 */
			getSecurityOperationName: function() {
				return "CanManageLogo";
			},

			/**
			 * Устанавливает результат проверки возможности выполнения администрируемой операции.
			 * @protected
			 * @virtual
			 * @param {String} operationName Имя администрируемой операции.
			 * @param {Boolean} result Результат проверки возможности выполнения администрируемой операции.
			 */
			setCanExecuteOperationResult: Terrasoft.emptyFn,

			/**
			 * Создает представление модуля, отображает его в контейнере и выполняет привязку модели представления и
			 * представления.
			 * @param {Ext.Element} renderTo Контейнер, в который загружется модуль.
			 */
			render: function(renderTo) {
				var view = this.generateView();
				view.bind(this.viewModel);
				view.render(renderTo);
				maskHelper.HideBodyMask();
			},

			/**
			 * Создает модель представления мцодуля.
			 * @return {Terrasoft.BaseViewModel} Модель представления модуля.
			 */
			createViewModel: function() {
				var Ext = this.Ext;
				var Terrasoft = this.Terrasoft;
				var sandbox = this.sandbox;
				var columns = {};
				var columnValues = {};
				var localizableStrings = resources.localizableStrings;
				var logoSysSettingsCfg = this.logoSysSettingsCfg;
				Terrasoft.each(logoSysSettingsCfg, function(logoSysSettingConfig) {
					var sysSettingCode = logoSysSettingConfig.code;
					var sysSettingValue = logoSysSettingConfig.value;
					columns[sysSettingCode] = {
						dataValueType: Terrasoft.DataValueType.BLOB
					};
					columnValues[sysSettingCode] = sysSettingValue;
					var defaultSysSettingValueColumnName = "default" + sysSettingCode;
					columns[defaultSysSettingValueColumnName] = {
						dataValueType: Terrasoft.DataValueType.BLOB
					};
					columnValues[defaultSysSettingValueColumnName] = sysSettingValue;
					var sysSettingValueSysImageIdColumnName = sysSettingCode + "_sysImageId";
					columns[sysSettingValueSysImageIdColumnName] = {
						dataValueType: Terrasoft.DataValueType.TEXT
					};
					columnValues[sysSettingValueSysImageIdColumnName] = null;
				}, this);
				columns.MarkerValue = {
					dataValueType: Terrasoft.DataValueType.TEXT
				};
				columnValues.MarkerValue = "sys-logo-settings";
				return Ext.create("Terrasoft.BaseViewModel", {
					columns: columns,
					values: columnValues,
					validationConfig: {},
					methods: {

						/**
						 * Возвращает признак того, заблокирована ли кнопка сохранения системных настроек.
						 * @return {Boolean}
						 */
						getSaveButtonVisible: function() {
							var changedSysSettings = this.getChangedSysSettings();
							var changedSysSettingsNames = Terrasoft.keys(changedSysSettings);
							return (changedSysSettingsNames.length > 0);
						},

						/**
						 * Возвращает признак видимости кнопки "Закрыть".
						 * @return {Boolean}
						 */
						getCloseButtonVisible: function() {
							var changedSysSettings = this.getChangedSysSettings();
							var changedSysSettingsNames = Terrasoft.keys(changedSysSettings);
							return !(changedSysSettingsNames.length > 0);
						},

						/**
						 * Возвращает объект с измененными систмными настройками. Имя свойства объекта -
						 * код системной настройки, а значение свойства - новое значение настройки. Если значение
						 * системной настройки не менялось, в объекте не будет соответствующего свойства.
						 * @return {Object}
						 */
						getChangedSysSettings: function() {
							var changedSysSettings = {};
							Terrasoft.each(logoSysSettingsCfg, function(logoSysSettingConfig) {
								var sysSettingCode = logoSysSettingConfig.code;
								var value = this.get(sysSettingCode);
								var defValue = this.get("default" + sysSettingCode);
								if (value !== defValue) {
									changedSysSettings[sysSettingCode] = value;
								}
							}, this);
							return changedSysSettings;
						},

						/**
						 * Обработчик нажатия на кнопку сохранения изменений системных настроек. Отправляет запрос
						 * на сервер для сохранения системных настроек. Если сервер не смог обработать запрос,
						 * будет отображено соответствующее сообщение.
						 */
						onSaveClick: function() {
							this.set("MarkerValue", "saving");
							var postData = {
								sysSettingsValues: this.getChangedSysSettings()
							};
							Terrasoft.SysSettings.postSysSettingsValues(postData, function(result) {
								if (!result.success) {
									this.showInformationDialog(localizableStrings.ServerErrorMessage, Ext.emptyFn);
									return;
								}
								this.onSysSettingsSaved(result.saveResult);
							}, this);
						},

						/**
						 * Обработчик ответа сервера на запрос сохраниения системных настроек. Если сохранение прошло
						 * удачно, пользователю отобразится соответствующее сообщение и будет выполнен переход
						 * на предыдущую страницу, иначе отображено сообщение с информацией о несохраненных значениях.
						 * @param {Object} saveResult Результат ответа сервера на запрос сохранения данных.
						 */
						onSysSettingsSaved: function(saveResult) {
							var saveErrors = [];
							Terrasoft.each(saveResult, function(saveResult, sysSettingCode) {
								if (saveResult !== true) {
									saveErrors.push(sysSettingCode);
								}
							}, this);
							if (saveErrors.length !== 0) {
								this.set("MarkerValue", "sys-logo-settings");
								var sysSettingsCaptions = [""];
								Terrasoft.each(saveErrors, function(sysSettingCode) {
									sysSettingsCaptions.push(logoSysSettingsCfg[sysSettingCode].caption);
								}, this);
								var saveErrorMessage = localizableStrings.SaveErrorMessage.replace(/\\n/g, "\n");
								var errorMessage = Terrasoft.getFormattedString(saveErrorMessage,
									sysSettingsCaptions.join("\n- "));
								this.showInformationDialog(errorMessage, Ext.emptyFn);
							} else {
								window.location.reload();
							}
						},

						/**
						 * Восстанавливает значения системных настроек в состояние до изменений, но не после сохранения.
						 */
						restoreInitialLogoSysSettings: function() {
							Terrasoft.each(logoSysSettingsCfg, function(logoSysSettingConfig) {
								var sysSettingCode = logoSysSettingConfig.code;
								var value = this.get(sysSettingCode);
								var initValue = this.get("default" + sysSettingCode);
								if (value !== initValue) {
									this.updateSysSettingValue({
										code: sysSettingCode,
										value: initValue,
										imageId: null
									});
								}
							}, this);
						},

						/**
						 * Обработчик события нажатия на кнопку "Отмена".
						 */
						onCancelClick: function() {
							this.restoreInitialLogoSysSettings();
						},

						/**
						 * Обработчик нажатия на кнопку отмены. Выполняет переход на предыдущую страницу.
						 */
						onCloseClick: function() {
							sandbox.publish("BackHistoryState");
						},

						/**
						 * Возвращает Url в формате data-url, для отображения текущего значения изображения
						 * системной настройи корпоративной символики.
						 * @param {String} sysSettingCode Код системной настройки.
						 * @return {String} Url в формате data-url.
						 */
						getImageSrc: function(sysSettingCode) {
							return this.getSysSettingImageSrc({
								code: sysSettingCode,
								value: this.get(sysSettingCode),
								sysImageId: this.get(sysSettingCode + "_sysImageId")
							});
						},

						/**
						 * @member Terrasoft
						 * @inheritdoc Terrasoft.SysLogoSettingsModule.getSysSettingUrlValue
						 */
						getSysSettingImageSrc: this.getSysSettingUrlValue,

						/**
						 * Обработчик события изменения значения системной настройки.
						 * @param {File} file Файл с изображением, который был выбран пользователем.
						 * @param {String} sysSettingCode Код системной настройки.
						 */
						onImageChange: function(file, sysSettingCode) {
							if (file) {
								var self = this;
								FileAPI.readAsBinaryString(file, function(e) {
									var eventType = e.type;
									if (eventType === "load") {
										self.onBinaryStringRead(sysSettingCode, file, e.result);
									} else if (eventType === "error") {
										throw new Terrasoft.UnknownException({
											message: e.error
										});
									}
								});
							} else {
								this.updateSysSettingValue({
									code: sysSettingCode,
									value: this.get("default" + sysSettingCode),
									imageId: null
								});
							}
						},

						/**
						 * Обработчик события чтение файла в бинарную строку. Метод переводит бинарную строку в
						 * формат base64 и сохраняет значение в модель представления. Для IE, дополнительно выполняется
						 * загрузка полученного файла на сервер в таблицу SysImage.
						 * @param {String} sysSettingCode Код системной настройки.
						 * @param {File} imageFile Загружаемый файл с изображением.
						 * @param {String} binaryString Строка с прочитанными бинарными данными файла.
						 */
						onBinaryStringRead: function(sysSettingCode, imageFile, binaryString) {
							var sysSettingValue = btoa(binaryString);
							if (Ext.isIE) {
								Terrasoft.ImageApi.upload({
									onComplete: this.onFileUpload.bind(this, sysSettingCode, sysSettingValue),
									onError: function(imageId, error) {
										if (error) {
											throw new Terrasoft.UnknownException({
												message: error
											});
										}
									},
									scope: this,
									file: imageFile
								});
							} else {
								this.set(sysSettingCode, sysSettingValue);
							}
						},

						/**
						 * Обработчик события загрузки файла на сервер в таблицу SysImage. Метод сохраняет новые
						 * значения в модель представления.
						 * @param {String} sysSettingCode Код системной настройки.
						 * @param {String} sysSettingValue Значение системной настройки в формате base64.
						 * @param {String} imageId Идентификатор записи с загруженным изображением в таблице SysImage.
						 */
						onFileUpload: function(sysSettingCode, sysSettingValue, imageId) {
							this.updateSysSettingValue({
								code: sysSettingCode,
								value: sysSettingValue,
								imageId: imageId
							});
						},

						/**
						 * Метод обновляет данные системной настройки в модели представления.
						 * @param {Object} sysSettingConfig Конфигурация системной настройки.
						 * @param {String} sysSettingConfig.code Код системной настройки.
						 * @param {String} sysSettingConfig.value Значение системной настройки.
						 * @param {String} sysSettingConfig.imageId Идентификатор записи с загруженным изображением
						 * в таблице SysImage.
						 */
						updateSysSettingValue: function(sysSettingConfig) {
							var sysSettingCode = sysSettingConfig.code;
							this.set(sysSettingCode + "_sysImageId", sysSettingConfig.imageId, {
								silent: true
							});
							this.set(sysSettingCode, sysSettingConfig.value);
						}

					}
				});
			},

			/**
			 * Возвращает URL-адрес для картинки по переданной конфигурации. URL формируется в формате data-url
			 * для всех браузеров кроме IE. Для IE формируется обычный URL на картинку сохранненную в таблице
			 * значений системных настроек. Если передан параметр imageId, URL указывает на картинку сохраненную
			 * в таблице SysImage.
			 * @param {Object} sysSettingConfig Конфигурационный объект запрашиваемой картинки.
			 * @param {String} sysSettingConfig.code Код системной настройки.
			 * @param {String} sysSettingConfig.value Значение системной настойки.
			 * @param {String} sysSettingConfig.imageId Идентификатор записи в таблице SysImage. Только для IE.
			 * @return {String} URL картинки.
			 */
			getSysSettingUrlValue: function(sysSettingConfig) {
				var urlBuilderConfig;
				if (Ext.isIE) {
					var sysImageId = sysSettingConfig.sysImageId;
					if (sysImageId) {
						urlBuilderConfig = {
							source: Terrasoft.ImageSources.SYS_IMAGE,
							params: {
								primaryColumnValue: sysImageId
							}
						};
					} else {
						urlBuilderConfig = {
							source: Terrasoft.ImageSources.SYS_SETTING,
							params: {
								r: sysSettingConfig.code
							}
						};
					}
				} else {
					urlBuilderConfig = {
						source: Terrasoft.ImageSources.URL,
						url: "data:image/*;base64," + sysSettingConfig.value
					};
				}
				return Terrasoft.ImageUrlBuilder.getUrl(urlBuilderConfig);
			},

			/**
			 * Генерирует представление модуля
			 * @return {Terrasoft.Container} Представление модуля.
			 */
			generateView: function() {
				var Ext = this.Ext;
				var logoSettingsViewConfig = this.generateLogoSettingsViewConfig();
				var localizableStrings = resources.localizableStrings;
				return Ext.create("Terrasoft.Container", {
					id: "sys-logo-settings",
					classes: {
						wrapClassName: ["sys-logo-settings"]
					},
					markerValue: {"bindTo": "MarkerValue"},
					items: [
						{
							className: "Terrasoft.Container",
							id: "buttons-container",
							items: [
								{
									className: "Terrasoft.Button",
									id: "save-button",
									markerValue: "save-button",
									caption: localizableStrings.SaveButtonCaption,
									style: Terrasoft.controls.ButtonEnums.style.GREEN,
									click: {
										bindTo: "onSaveClick"
									},
									classes: {
										textClass: ["save-button"]
									},
									visible: {
										bindTo: "getSaveButtonVisible"
									}
								},
								{
									className: "Terrasoft.Button",
									id: "cancel-button",
									markerValue: "cancel-button",
									caption: localizableStrings.CancelButtonCaption,
									click: {
										bindTo: "onCancelClick"
									},
									visible: {
										bindTo: "getSaveButtonVisible"
									}
								},
								{
									className: "Terrasoft.Button",
									id: "close-button",
									markerValue: "close-button",
									caption: localizableStrings.CloseButtonCaption,
									click: {
										bindTo: "onCloseClick"
									},
									visible: {
										bindTo: "getCloseButtonVisible"
									}
								}
							]
						},
						logoSettingsViewConfig
					]
				});
			},

			/**
			 * Генерирует представление для области редактирования системных настроек корпоративной символики.
			 * @return {Object} Конфигурационный объект области редактирования системных настроек.
			 */
			generateLogoSettingsViewConfig: function() {
				var logoSysSettingsCfg = this.logoSysSettingsCfg;
				var gridLayoutItemsConfig = [];
				var labelColumn = 0;
				var row = 0;
				var rowSpan = 3;
				var imageEditColumn = 4;
				var imageEditColumnSpan = 10;
				var labelColumnSpan = imageEditColumn;
				this.Terrasoft.each(logoSysSettingsCfg, function(sysSettingConfig) {
					gridLayoutItemsConfig.push({
						column: labelColumn,
						row: row,
						colSpan: labelColumnSpan,
						rowSpan: rowSpan,
						item: this.getLabelViewConfig(sysSettingConfig)
					});
					gridLayoutItemsConfig.push({
						column: imageEditColumn,
						row: row,
						colSpan: imageEditColumnSpan,
						rowSpan: rowSpan,
						item: this.getImageEditViewConfig(sysSettingConfig)
					});
					row += rowSpan + 1;
				}, this);
				return {
					className: "Terrasoft.GridLayout",
					id: "sys-logo-settings-content",
					items: gridLayoutItemsConfig
				};
			},

			/**
			 * Генерирует представление для элемента управления Terrasoft.Label, для заголовка системной настройки.
			 * @param {Object} sysSettingConfig Мета-информация системной настройи.
			 * @return {Object} Конфигурационный объект элемента управления Terrasoft.Label.
			 */
			getLabelViewConfig: function(sysSettingConfig) {
				var sysSettingCode = sysSettingConfig.code;
				return {
					className: "Terrasoft.Container",
					id: sysSettingConfig.code +  "-label-wrap",
					classes: {
						wrapClassName: ["logo-label-wrap"]
					},
					items: [
						{
							className: "Terrasoft.Label",
							id: sysSettingCode +  "-label",
							caption: sysSettingConfig.caption
						}
					]
				};
			},

			/**
			 * Генерирует представление для элемента управления Terrasoft.ImageEdit,
			 * для редактирования системной настройки.
			 * @param {Object} sysSettingConfig Мета-информация системной настройи.
			 * @return {Object} Конфигурационный объект элемента управления Terrasoft.ImageEdit.
			 */
			getImageEditViewConfig: function(sysSettingConfig) {
				var sysSettingCode = sysSettingConfig.code;
				var imageUrl = this.getSysSettingUrlValue({
					code: sysSettingCode,
					value: sysSettingConfig.value
				});
				return {
					className: "Terrasoft.Container",
					id: sysSettingCode + "-img-wrap",
					items: [
						{
							className: "Terrasoft.ImageEdit",
							id: sysSettingCode + "-img",
							markerValue: sysSettingCode,
							defaultImageSrc: imageUrl,
							tag: sysSettingCode,
							imageSrc: {
								bindTo: "getImageSrc"
							},
							change: {
								bindTo: "onImageChange"
							},
							width: "auto",
							height: "100%"
						}
					]
				};
			},

			/**
			 * Заменяет последний элемент в цепочке состояний, если его идентификатор модуля отличается от текущего.
			 * @protected
			 * @virtual
			 */
			initHistoryState: function() {
				var sandbox = this.sandbox;
				var state = sandbox.publish("GetHistoryState");
				var currentHash = state.hash;
				var currentState = state.state || {};
				if (currentState.moduleId === sandbox.id) {
					return;
				}
				var newState = this.prepareHistorySate(currentState);
				sandbox.publish("ReplaceHistoryState", {
					stateObj: newState,
					pageTitle: null,
					hash: currentHash.historyState,
					silent: true
				});
			},

			/**
			 * Подготавливает новое состояние страницы.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает новое состояние страницы.
			 */
			prepareHistorySate: function(currentState) {
				var newState = this.Terrasoft.deepClone(currentState);
				newState.moduleId = this.sandbox.id;
				return newState;
			},

			/**
			 * Очищает все подписки на события и уничтожает объект.
			 * @overridden
			 * @param {Object} config Параметры уничтожения модуля.
			 */
			destroy: function(config) {
				if (config.keepAlive !== true) {
					if (this.viewModel) {
						this.viewModel.destroy();
						this.viewModel = null;
					}
					this.callParent(arguments);
				}
			}

		});
	}
);
