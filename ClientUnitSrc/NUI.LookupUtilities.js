define("LookupUtilities", ["terrasoft", "MaskHelper", "ModalBox"],
		function(Terrasoft, MaskHelper, ModalBox) {

			/**
			 * Id LookupPage-а
			 * @private
			 * @type {String}
			 */
			var lookupPageId;

			/**
			 * Контейнер в который будет отрисован LookupPage
			 * @private
			 * @type {Object}
			 */
			var modalBoxContainer;

			/**
			 * имя модуля LookupPage-а
			 * @private
			 * @type {String}
			 */
			var lookupPageName = "LookupPage";
			/**
			 * Флаг, который устанавливается, в случае если обращается CardProcessModule
			 * @private
			 * @type {Boolean}
			 */
			var openProcess;
			var ModalBoxSize = {
				MinHeight : "1",
				MinWidth : "1",
				MaxHeight : "100",
				MaxWidth : "100"
			};

			/**
			 * Посылает сообщение о том, что нужно открыть справочник
			 * Используеться только в деталях
			 * @public
			 */
			function throwOpenLookupMessage(sandbox, config, callback, scope, tag) {
				window.console.warn(Ext.String.format(Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage,
						"throwOpenLookupMessage", "open"));
				var handler = function(args) {
					callback.call(scope, args);
				};
				sandbox.publish("OpenLookupPage", {
					config: config,
					handler: handler
				}, tag ? [tag] : []);
			}

			function openFolderPage(sandbox, config, callback, scope) {
				var handler;
				if (callback) {
					handler = function(args) {
						callback.call(scope, args);
					};
				}
				MaskHelper.ShowBodyMask();
				sandbox.publish("OpenFolderPage", {
					config: config,
					handler: handler
				}, [sandbox.id]);
			}
			/**
			 * Возвращает структуру базовой страницы справочника
			 * @public
			 * @return {Object}
			 */
			function getBaseLookupPageStructure() {
				return [
					{
						type: Terrasoft.ViewModelSchemaItem.GROUP,
						name: "baseElementsControlGroup",
						visible: true,
						collapsed: false,
						wrapContainerClass: "main-elements-control-group-container",
						items: [{
							type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
							name: "Id",
							columnPath: "Id",
							visible: false,
							viewVisible: false
						}, {
							type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
							name: "Name",
							columnPath: "Name",
							dataValueType: Terrasoft.DataValueType.TEXT
						}, {
							type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
							name: "Description",
							columnPath: "Description",
							dataValueType: Terrasoft.DataValueType.TEXT
						}]
					}
				];
			}
			/**
			 * Закрывает модальное окно Lookup-а и но не выгружает сам модуль
			 * все сообщения Lookup-а остаются
			 * @public
			 */
			function hide() {
				if (!openProcess) {
					ModalBox.close();
					modalBoxContainer = null;
				}
			}
			function getFixedHeaderContainer() {
				return ModalBox.getFixedBox();
			}
			/**
			 * Существует для сохранения совместимости, т.е. для тех случаев когда Lookup открывается на весь экран
			 * Используется ТОЛЬКО с процессами
			 * @public
			 */
			function openLookupPage(sandbox, openLookupPageArgs, scope, renderTo, keepAlive, useViewModule) {
				window.console.warn(Ext.String.format(Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage,
						"openLookupPage", "open"));
				openProcess = true;
				if (Ext.isEmpty(openLookupPageArgs.config)) { return; }
				if (!Ext.isEmpty(openLookupPageArgs.config.lookupPageName)) {
					lookupPageName = openLookupPageArgs.config.lookupPageName;
				}
				sandbox.subscribe("CardProccessModuleInfo", function() {
					return true;
				}, [sandbox.id + "_LookupPage"]);
				if (!scope.lookupPageParamsById) {
					scope.lookupPageParamsById = [];
				}
				keepAlive = (keepAlive === undefined) ? true : keepAlive;
				lookupPageId = sandbox.id + "_LookupPage";
				sandbox.subscribe("LookupInfo", function() {
					scope.lookupPageParamsById[lookupPageId] = openLookupPageArgs.config;
					return scope.lookupPageParamsById[lookupPageId];
				}, [lookupPageId]);
				var params = sandbox.publish("GetHistoryState");
				if (keepAlive) {
					sandbox.publish("PushHistoryState", {hash: params.hash.historyState});
				}
				var moduleName = "LookupPage";
				if (openLookupPageArgs.config.moduleName) {
					moduleName = openLookupPageArgs.config.moduleName;
				}
				MaskHelper.ShowBodyMask();
				if (useViewModule) {
					sandbox.publish("LoadModule", {
						renderTo: renderTo,
						moduleId: lookupPageId,
						moduleName: moduleName,
						keepAlive: keepAlive
					});
				} else {
					sandbox.loadModule(moduleName, {
						renderTo: renderTo,
						id: lookupPageId,
						keepAlive: keepAlive
					});
				}
				sandbox.subscribe("ResultSelectedRows", openLookupPageArgs.handler, [lookupPageId]);
			}
			/**
			 * Открывает Lookup в модальном окне
			 * @public
			 * @param {Object} sandbox
			 * @param {Object} config
			 * @param {Function} callback
			 * @param {Object} scope
			 * @param {Object} renderTo
			 * @param {Boolean} keepAlive
			 * @param {Boolean} useViewModule
			 *
			 * Пример конфигурации для lookup, для которого нужна отдельная настройка колонок:
			 * var config = {
			 *		entitySchemaName: "SysAdminUnit",
			 *		multiSelect: true,
			 *		columns: ["Contact", "Name"],
			 *		hideActions: true,
			 *		lookupPostfix: "_UsersDetail"
			 * };
			 */
			function open(sandbox, config, callback, scope, renderTo, keepAlive, useViewModule) {
				var openLookupConfig = {};
				if (Ext.isEmpty(config)) { return; }
				openLookupConfig.sandbox = sandbox;
				openLookupConfig.callback = callback;
				openLookupConfig.scope = scope;
				openLookupConfig.config = config;
				openLookupConfig.renderTo = renderTo;
				if (!Ext.isEmpty(config.lookupPageName)) {
					lookupPageName = config.lookupPageName;
				}
				if (keepAlive === undefined) {
					openLookupConfig.keepAlive = false;
				} else {
					openLookupConfig.keepAlive = keepAlive;
				}
				if (useViewModule === undefined) {
					openProcess = false;
				}
				openLookupConfig.useViewModule = useViewModule;
				lookupPageId = sandbox.id + "_LookupPage";
				modalBoxContainer = ModalBox.show({
					minWidth: ModalBoxSize.MinWidth,
					maxWidth: ModalBoxSize.MaxWidth,
					minHeight: ModalBoxSize.MinHeight,
					maxHeight: ModalBoxSize.MaxHeight,
					boxClasses: config.modalBoxClasses
				}, function(destroy) {
					if (destroy) {
						sandbox.unloadModule(sandbox.id + "_LookupPage");
					}
				}, this);
				ModalBox.setSize(820, 600);
				sandbox.subscribe("LookupInfo", function() {
					if (!scope.lookupPageParamsById) {
						scope.lookupPageParamsById = [];
					}
					scope.lookupPageParamsById[lookupPageId] = openLookupConfig.config;
					scope.lookupPageParamsById[lookupPageId].isQuickAdd = config.isQuickAdd;
					scope.lookupPageParamsById[lookupPageId].valuePairs = config.valuePairs;
					return scope.lookupPageParamsById[lookupPageId];
				}, [lookupPageId]);
				MaskHelper.ShowBodyMask();
				sandbox.loadModule(lookupPageName, {
					renderTo: modalBoxContainer,
					id: lookupPageId,
					keepAlive: keepAlive
				});
				sandbox.subscribe("ResultSelectedRows", function(args) {
					openLookupConfig.callback.call(openLookupConfig.scope, args);
					close(openLookupConfig.sandbox);
				}, [lookupPageId]);
			}
			function getGridContainer() {
				return modalBoxContainer;
			}


			/**
			 * Закрывает модальное окно Lookup-а и выгружает модуль (если запущен он открыт не из CardProcessModule)
			 * @public
			 */
			function close(sandbox) {
				if (!openProcess) {
					if (modalBoxContainer && modalBoxContainer.dom) {
						ModalBox.close();
					}
					sandbox.unloadModule(sandbox.id + "_LookupPage");
				}
			}
			function updateSize() {
				ModalBox.updateSizeByContent();
			}
			return {
				Open: open,
				UpdateSize: updateSize,
				ThrowOpenLookupMessage: throwOpenLookupMessage,
				OpenLookupPage: openLookupPage,
				Close: close,
				Hide: hide,
				OpenFolder: openFolderPage,
				GetBaseLookupPageStructure: getBaseLookupPageStructure,
				GetFixedHeaderContainer: getFixedHeaderContainer,
				GetGridContainer: getGridContainer
			};
		});