define("ProcessModuleUtilities", ["ext-base", "terrasoft", "ProcessModuleUtilitiesResources",
		"ConfigurationConstants", "MaskHelper",  "ConfigurationEnums"],
	function(Ext, Terrasoft, resources, ConfigurationConstants, MaskHelper, ConfigurationEnums) {
	/**
	 * @class Terrasoft.configuration.ProcessModuleUtilities
	 * Класс ProcessModuleUtilities содержит утилитные методы для работы со схемами процессов
	 */
	Ext.define("Terrasoft.configuration.ProcessModuleUtilities", {
		alternateClassName: "Terrasoft.ProcessModuleUtilities",
		singleton: true,
		PROCESS_ENGINE_SERVICE_NAME: "ServiceModel/ProcessEngineService.svc",
		PROCESS_SCHEMA_MANAGER_SERVICE_NAME: "ServiceModel/ProcessSchemaManagerService.svc",
		REQUEST_TIMEOUT: 900000000,

		/**
		 * Флаг, указывающий на то, что приложение работает в демо-режиме
		 * @protected
		 * @type {Boolean}
		 */
		isDemoBuild: false,

		/**
		 * Конструктор класса.
		 * @protected
		 */
		constructor: function() {
			this.callParent(arguments);
			this.setIsDemoBuild();
		},

		/**
		 * Инициализирует признак демо-сборки
		 * @private
		 */
		setIsDemoBuild: function() {
			Terrasoft.SysSettings.querySysSettingsItem("ShowDemoLinks", function(value) {
				this.isDemoBuild = value;
			}, this);
		},

		/**
		 * Проверяет, что приложение работает в демо-режиме и выводит соотв. сообщение
		 * @param {Object} scope Контекст модели, в рамках которого проводится проверка
		 */
		getIsDemoMode: function(scope) {
			if (this.isDemoBuild) {
				scope.showInformationDialog(resources.localizableStrings.DisableInDemoMessage);
			}
			return this.isDemoBuild;
		},

		/**
		 * Возвращает колличество запущенных элементов процесса
		 * @param procExecDataCollection Коллексция запущенных элементов процесса
		 * @returns {number}
		 */
		getProcExecDataCollectionCount: function(procExecDataCollection) {
			var itemsCount = 0;
			for (var propertyName in procExecDataCollection) {
				if (!procExecDataCollection.hasOwnProperty(propertyName) || propertyName === "previousProcElUId") {
					continue;
				}
				var item = procExecDataCollection[propertyName];
				if (item && (typeof item !== "function") && !Ext.isEmpty(item.procElUId)) {
					itemsCount++;
				}
			}
			return itemsCount;
		},

		/**
		 * Открывает 5x диграмму выполнения процессов
		 * @param {String} schemaUId Уникальный идентификатор cхемы
		 */
		showProcessDiagram: function(schemaUId) {
			var url = "../ViewPage.aspx?Id=" + ConfigurationConstants.ProcessLog.sysProcessLogViewPageId +
				"&recordId=" + schemaUId;
			window.open(url);
		},

		/**
		 * Открывает дизайнер процессов 5x
		 * @param {String} schemaUId Уникальный идентификатор cхемы, если не задан будет отрыт дизайнер новой схемы
		 */
		show5xProcessSchemaDesigner: function(schemaUId) {
			var schemaUIdParameter = Ext.isEmpty(schemaUId) ? "" : schemaUId;
			Terrasoft.AjaxProvider.request({
				url: "../ServiceModel/ProcessSchemaManagerService.svc/PrepareSchemaForEdit?schemaUId=" +
						schemaUIdParameter,
				method: "POST",
				scope: this,
				callback: function(request, success, response) {
					if (success) {
						var isNewSchema = (Ext.isEmpty(schemaUId) || Terrasoft.isEmptyGUID(schemaUId)) ? "1" : "0";
						var url = "../Designers/ProcessSchemaDesigner.aspx?Id=" +
								Ext.decode(response.responseText) + "&isNewSchema=" + isNewSchema;
						window.open(url);
					}
				}
			});
		},

		/**
		 * Открывает дизайнер процессов 7x
		 * @param {String} schemaUId Уникальный идентификатор cхемы, если не задан будет отрыт дизайнер новой схемы
		 */
		show7xProcessSchemaDesigner: function(schemaUId) {
			var isNewSchema = (Ext.isEmpty(schemaUId) || Terrasoft.isEmptyGUID(schemaUId)) ? "1" : "0";
			var schemaUIdParameter = Ext.isEmpty(schemaUId) ? Terrasoft.generateGUID() : schemaUId;
			window.open("./SchemaDesigner.aspx#process/" + schemaUIdParameter + "/" + isNewSchema);
		},

		/**
		 * Возвращает имя продукта необходимое для отображения контекстной справки
		 * @return {String} Имя продукта.
		 */
		getContextHelpProductName: function() {
			return "BPMS";
		},

		/**
		 * Открывает карточку редактирования активности по бизнес-процессу.
		 * @param {Object} config Объект конфигурации.
		 * Примеры вызова:
		 * 1. tryShowProcessCard(config);
		 * 2. tryShowProcessCard(prcElId, recordId, operation);
		 * @return {boolean} Открыта ли карточка редактирования.
		 */
		tryShowProcessCard: function(config) {
			var processExecDataConfig = {
					scope: this,
					parentMethodArguments: null,
					parentMethod: null,
				operation:  ConfigurationEnums.CardStateV2.EDIT
			};
			if (Ext.isObject(config)) {
				processExecDataConfig = Ext.apply(processExecDataConfig, config);
			} else {
				processExecDataConfig.procElUId = arguments[0];
				processExecDataConfig.recordId = arguments[1];
				if (arguments.length > 2) {
					processExecDataConfig.operation = arguments[2];
				}
			}
			if (processExecDataConfig.procElUId && !Terrasoft.isEmptyGUID(processExecDataConfig.procElUId)) {
				this.sandbox.publish("ProcessExecDataChanged", processExecDataConfig);
				return true;
			}
			return false;
		},

		/**
		 * Вызывает метод веб сервиса с указанными параметрами
		 * @param {Object} config обьект, который содержит название сервиса, название метода, данные
		 * @param {Function} callback Функция обратного вызова
		 * @param {Object} scope Контекст callback-функции.
		 * @returns {Object} обьект запроса
		 */
		callService: function(config, callback, scope) {
			var dataSend = config.data || {};
			var jsonData = (config.encodeData === false) ? dataSend : Ext.encode(dataSend);
			var requestUrl = Terrasoft.combinePath(Terrasoft.workspaceBaseUrl,
				config.serviceName, config.methodName);
			return Terrasoft.AjaxProvider.request({
				url: requestUrl,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: jsonData,
				callback: callback,
				scope: scope || this,
				timeout: config.timeout
			});
		},

		/**
		 * Функция, которая вызывается после выполнения метода сервиса
		 * @private
		 * @param {Object} request Экземпляр запроса
		 * @param {Boolean} success Признак успешного ответа сервера
		 * @param {Object} response Ответ сервера
		 */
		responseCallback: function(request, success, response) {
			MaskHelper.HideBodyMask();
			if (!success || !response.responseText) {
				return;
			}
			var responseData = Ext.decode(Ext.decode(response.responseText));
			if (!responseData) {
				return;
			}
			if (responseData.message) {
				Terrasoft.utils.showInformation(responseData.message);
			}
			if (responseData.success) {
				return;
			}
			if (window.console && window.console.warn) {
				window.console.warn(responseData.message);
			}
		},
		/**
		 * Запускает на выполнение бизнес-процесс
		 * @private
		 * @param {String} processName Имя схемы процесса
		 * @param {Object} processParameters Параметры процесса
		 * @param {Function} callback Функция обратного вызова
		 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения
		 */
		runProcess: function(processName, processParameters, callback, scope) {
			var parametersQueryString = "";
			if (!Ext.isEmpty(processParameters)) {
				parametersQueryString += "?";
				var isNotFirstParameter = false;
				Terrasoft.each(processParameters, function(value, name) {
					if (isNotFirstParameter) {
						parametersQueryString += "&";
					} else {
						isNotFirstParameter = true;
					}
					parametersQueryString += name + "=" + value;
				}, scope);
			}
			MaskHelper.ShowBodyMask();
			this.callService({
				serviceName: this.PROCESS_ENGINE_SERVICE_NAME,
				methodName: processName + "/RunProcess" + parametersQueryString
			}, callback, scope);
		},

		/**
		 * Сохранить схему БП
		 */
		saveProcessSchema: function(scope, schema, callback) {
			var responseCallback = function(request, success, response) {
				if (!success) {
					return;
				}
				var responseObject = Ext.decode(Ext.decode(response.responseText));
				if (callback) {
					callback.call(scope || this, responseObject);
				}
				if (responseObject.success && responseObject.message) {
					Terrasoft.utils.showInformation(responseObject.message);
				}
			};
			this.callService({
				serviceName: this.PROCESS_SCHEMA_MANAGER_SERVICE_NAME,
				methodName: "Save",
				data: schema || {},
				timeout: this.REQUEST_TIMEOUT
			}, responseCallback, scope);
		},
		/**
		 * Загрузить данные схемы БП.
		 * @param {Object} scope Контекст выполнения функции
		 * @param {Guid} schemaUId идентификатор схемы процесса
		 * @param {Function} callback Функция обратного вызова
		 */
		loadProcessSchema: function(scope, schemaUId, callback) {
			MaskHelper.ShowBodyMask();
			var responseCallback = function(request, success, response) {
				MaskHelper.HideBodyMask();
				if (success && callback) {
					var data = Ext.decode(Ext.decode(response.responseText));
					callback.call(scope || this, data);
				}
			};
			this.callService({
				serviceName: this.PROCESS_SCHEMA_MANAGER_SERVICE_NAME,
				methodName: schemaUId + "/Load"
			}, responseCallback, scope);
		},
		/**
		 * Возвращает уникальное имя и заголовок схемы БП
		 * @private
		 */
		getUniqueNameAndCaption: function(callback, scope) {
			var responseCallback = function(request, success, response) {
				if (success) {
					var uniqueNameAndCaption = Ext.decode(Ext.decode(response.responseText));
					callback.call(scope || this, uniqueNameAndCaption);
				}
			};
			this.callService({
				serviceName: this.PROCESS_SCHEMA_MANAGER_SERVICE_NAME,
				methodName: "GetUniqueNameAndCaption"
			}, responseCallback, scope);
		},
		/**
		 * Запускает бизнес-процесс по идентификатору или по имени схемы процесса
		 * @param {String} sysProcessName Имя схемы процесса
		 * @param {String} sysProcessId Идентификатор схемы процесса
		 * @param {Object} parameters Параметры процесса
		 */
		executeProcess: function(args) {
			var sysProcessName = args.sysProcessName;
			var callback = this.responseCallback;
			if (!Ext.isEmpty(sysProcessName)) {
				this.runProcess(sysProcessName, args.parameters, callback, this);
				return;
			}
			var sysProcessId = args.sysProcessId;
			var scope = this;
			var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "VwSysProcess"
			});
			esq.addColumn("Id", "Id");
			esq.addColumn("Name", "Name");
			esq.getEntity(sysProcessId, function(result) {
				if (!Ext.isEmpty(result.entity)) {
					var processName = result.entity.get("Name");
					this.runProcess(processName, args.parameters, callback, scope);
				}
			}, this);
		},
		/**
		 * Позволяет выполнить публикацию схем
		 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения
		 */
		publish: function(scope) {
			MaskHelper.ShowBodyMask({
				caption: resources.localizableStrings.PublishMaskCaption
			});
			this.callService({
				serviceName: this.PROCESS_SCHEMA_MANAGER_SERVICE_NAME,
				methodName: "Publish",
				timeout: this.REQUEST_TIMEOUT
			}, this.responseCallback, scope || this);
		},
		/**
		 * Продолжает выполнение процесса.
		 * @param {String} processUId Уникальный идентификатор процесса.
		 * @param {Object} scope Контекст выполнения.
		 */
		continueExecuting: function(processUId, scope) {
			MaskHelper.ShowBodyMask();
			var callback = function() {
				MaskHelper.HideBodyMask();
			};
			this.callService({
				serviceName: this.PROCESS_ENGINE_SERVICE_NAME,
				methodName: processUId + "/ContinueExecuting",
				timeout: this.REQUEST_TIMEOUT
			}, callback, scope);
		},
		/**
		 * Отменяет выполнение всех запущенных экземпляров процессов по схеме
		 * @param {Object} scope Контекст выполнения функции
		 * @param {Guid} schemaId Идентификатор схемы в рабочем пространстве пользователя
		 * @param {Function} callback Функция обратного вызова
		 */
		cancelExecutionBySchemaId: function(scope, schemaId, callback) {
			MaskHelper.ShowBodyMask();
			var responseCallback = function(request, success, response) {
				MaskHelper.HideBodyMask();
				var responseObject = null;
				if (success) {
					responseObject = Ext.decode(Ext.decode(response.responseText));
					var message = responseObject.message;
					if (message) {
						Terrasoft.utils.showInformation(message);
					}
				}
				if (callback) {
					callback.call(scope, responseObject);
				}
			};
			this.callService({
				serviceName: this.PROCESS_ENGINE_SERVICE_NAME,
				methodName: "CancelExecutionBySchemaId?schemaId=" + schemaId,
				timeout: this.REQUEST_TIMEOUT
			}, responseCallback, scope);
		},
		/**
		 * Отображает маску
		 */
		showBodyMask: function() {
			MaskHelper.ShowBodyMask();
		},
		/**
		 * Удаляет маску
		 */
		hideBodyMask: function() {
			MaskHelper.HideBodyMask();
		},
		/**
		 * Запускает бизнес процесс.
		 * @param {Object} tag Параметры запуска процесса.
		 * @param {String} tag.name Название запускаемого процесса.
		 * @param {Object} tag.scope Контекст вызова.
		 * @param {Object} tag.parameters Параметры процесса.
		 * @param {Function} tag.callback  Функция обратного вызова.
		 */
		startBusinessProcess: function(tag) {
			var scope = tag.scope || this,
				parametersQueryString = "";
			if (!Ext.isEmpty(tag.parameters)) {
				parametersQueryString += "?";
				var isNotFirstParameter = false;
				Terrasoft.each(tag.parameters, function(value, name) {
					if (isNotFirstParameter) {
						parametersQueryString += "&";
					} else {
						isNotFirstParameter = true;
					}
					parametersQueryString += name + "=" + value;
				}, scope);
			}
			var responseCallback = function() {
			};
			var tagCallback = tag.callback;
			if (Ext.isFunction(tagCallback)) {
				responseCallback = function(request, success, response) {
					var completeExecutionData;
					var errorMessage = response.responseText;
					if (success) {
						if (response && response.responseXML && response.responseXML.firstChild) {
							var responseContent = response.responseXML.firstChild;
							var responseText = responseContent.textContent || responseContent.text || null;
							completeExecutionData = Ext.decode(responseText, true);
							if (!Ext.isEmpty(completeExecutionData)) {
								errorMessage = null;
							}
						}
					}
					if (!Ext.isEmpty(errorMessage)) {
						if (Ext.isDefined(Ext.global.console) && Ext.isFunction(Ext.global.console.error)) {
							var message = Ext.String.format(resources.localizableStrings.ErrorStartBusinessProcess,
								tag.name, errorMessage);
							Ext.global.console.error(message);
						}
					}
					tagCallback.call(scope, success, completeExecutionData);
				};
			}
			Terrasoft.AjaxProvider.request({
				url: Terrasoft.workspaceBaseUrl + "/ServiceModel/ProcessEngineService.svc/" +
				tag.name + "/Execute" + parametersQueryString,
				method: "POST",
				jsonData: {},
				scope: scope,
				callback: responseCallback
			});
		},

		/**
		 * Создает запрос, который вычитывает доступные процессы для запуска.
		 * @param {Array} filters Набор фильтров.
		 * @return {Terrasoft.EntitySchemaQuery} Объект запроса.
		 */
		createRunProcessSelect: function(filters) {
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "VwSysProcess"
			});
			var idColumnName = "Id";
			var captionColumnName = "Caption";
			select.addColumn(idColumnName);
			select.addColumn(captionColumnName);
			var vwSysProcessFilters = Terrasoft.createFilterGroup();
			vwSysProcessFilters.name = "vwSysProcessFiler";
			vwSysProcessFilters.logicalComparisonTypes = Terrasoft.LogicalOperatorType.AND;
			vwSysProcessFilters.addItem(Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, "SysWorkspace",
				Terrasoft.SysValue.CURRENT_WORKSPACE.value));
			vwSysProcessFilters.addItem(Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, "IsMaxVersion", true));
			if (filters) {
				Terrasoft.each(filters, function(filter) {
					vwSysProcessFilters.addItem(filter);
				}, this);
			}
			select.filters.add("availableProcesses", vwSysProcessFilters);
			return select;
		},
		/**
		 * Добавляет для выпадающего списка данные пакета Custom.
		 * @private
		 * @param {Object} rows Данные для выпадающего списка.
		 * @param {String} customPackageUId Идентификатор пакета Custom.
		 */
		addCustomPackage: function(rows, customPackageUId) {
			rows[customPackageUId] = {
				"UId": customPackageUId,
				"value": customPackageUId,
				"displayValue": resources.localizableStrings.CustomPackageName
			};
		},
		/**
		 * Добавляет в справочник SysPackage Custom пакет, если он еще не создан.
		 * @private
		 * @param {Terrasoft.Collection} list  Список пакетов.
		 * @param {Object} rows Данные для выпадающего списка.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст выполнения метода.
		 */
		tryAddCustomPackage: function(list, rows, callback, scope) {
			Terrasoft.SysSettings.querySysSettingsItem("CustomPackageUId",
				function(customPackageUId) {
					var guidEmpty = Terrasoft.GUID_EMPTY;
					customPackageUId = (customPackageUId && customPackageUId.value) ?
							customPackageUId.value : guidEmpty;
					if (!rows[customPackageUId] && !rows[guidEmpty]) {
						this.addCustomPackage(rows, guidEmpty);
					}
					callback.call(scope || this, list, rows);
				}, this);
		},
		/**
		 * Обработчик события подготовки данных для выпадающего списка пакетов
		 * @filter {Object} Фильры для подготовки данных
		 * @list {Terrasoft.Collection} Данные для выпадающего списка
		 * @public
		 */
		onPrepareSysPackageList: function(filter, list) {
			list.clear();
			var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "SysPackage"
			});
			esq.addColumn("UId");
			esq.addColumn("Id");
			esq.addColumn("Name");
			esq.filters.add("SysWorkspace", Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "SysWorkspace",
					Terrasoft.SysValue.CURRENT_WORKSPACE.value));
			esq.filters.add("Maintainer", Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "Maintainer",
					Terrasoft.SysValue.CURRENT_MAINTAINER.value));
			esq.getEntityCollection(function(response) {
				var collection = response.collection;
				var rows = {};
				if (collection && collection.collection.length > 0) {
					Terrasoft.each(collection.collection.items, function(item) {
						var listValue = {
							UId: item.values.UId,
							value: item.values.Id,
							displayValue: item.values.Name
						};
						rows[item.values.UId] = listValue;
					}, this);
				}
				this.tryAddCustomPackage(list, rows, function(list, rows) {
					var sortedList = Ext.create("Terrasoft.Collection");
					sortedList.loadAll(rows);
					sortedList.sort("displayValue", Terrasoft.OrderDirection.ASC);
					list.loadAll(sortedList);
				}, this);
			}, this);
		},
		/**
		 * Получает список доступных результатов пользовательского действия
		 * @param {object} scope Контекст выполнения функции
		 * @param {object} processActivity Параметры пользовательского действия
		 * @param {Function} callback Функция обратного вызова
		 */
		getProcessActivityResultsLookupGridData: function(scope, processActivity, callback) {
			var responseCallback = function(request, success, response) {
				if (success) {
					var resultsLookupGridData = Ext.decode(Ext.decode(response.responseText));
					callback.call(scope || this, resultsLookupGridData);
				}
			};
			this.callService({
				serviceName: this.PROCESS_SCHEMA_MANAGER_SERVICE_NAME,
				methodName: "GetProcessActivityResultsLookupGridData",
				data: processActivity || {}
			}, responseCallback, scope || this);
		}
	});
	return Terrasoft.ProcessModuleUtilities;
});
