define("BaseCommunicationViewModel", ["ConfigurationConstants", "BaseCommunicationViewModelResources",
		"CommunicationUtils", "EmailHelper"],
	function(ConfigurationConstants, resources, CommunicationUtils, EmailHelper) {
	Ext.define("Terrasoft.configuration.BaseCommunicationViewModel", {
		alternateClassName: "Terrasoft.BaseCommunicationViewModel",
		extend: "Terrasoft.BaseViewModel",

		/**
		 * Возвращает заголовок кнопки выбора типа средства связи.
		 * @private
		 * @return {String} Заголовок кнопки выбора типа средства связи.
		 */
		getTypeButtonCaption: function() {
			var communicationType = this.get("CommunicationType");
			if (!communicationType) {
				return resources.localizableStrings.CommunicationTypePlaceholder;
			} else {
				return communicationType.displayValue;
			}
		},

		/**
		 * Удаляет элемент из коллекции.
		 * @private
		 */
		deleteItem: function() {
			this.isDeleted = true;
			this.fireEvent("change", this, {
				OperationType: "Delete"
			});
		},

		/**
		 * Устанавливает измененный тип средства связи.
		 * @param {String} tag Содержит значение нового типа.
		 * @private
		 */
		typeChanged: function(tag) {
			var communicationTypes = this.get("CommunicationTypes");
			var communicationType = communicationTypes.get(tag);
			this.set("CommunicationType", {
				value: communicationType.get("Id"),
				displayValue: communicationType.get("Name")
			});
			this.validate();
			this.updateLinkUrl(this.get("Number"));
		},

		/**
		 * Указывает является ли тип средства связи одним из типов соц. сетей.
		 * @private
		 * @param {String} communicationType Значение типа элемента.
		 * @return {boolean}
		 */
		isSocialNetworkType: function(communicationType) {
			return CommunicationUtils.isSocialNetworkType(communicationType);
		},

		/**
		 * Возвращает доступность поля редактирования средства связи.
		 * @protected
		 * @return {Boolean} Доступность поля редактирования средства связи.
		 */
		getCommunicationEnabled: function() {
			var communicationType = this.get("CommunicationType");
			if (!communicationType) {
				return true;
			}
			return !this.isSocialNetworkType(communicationType);
		},

		/**
		 * Возвращает доступность отображения правой иконки средства связи.
		 * @protected
		 * @return {boolean} Доступность отображения правой иконки средства связи.
		 */
		getRightIconEnabled: function() {
			var communicationType = this.get("CommunicationType");
			if (!communicationType) {
				return false;
			}
			return !this.isSocialNetworkType(communicationType);
		},

		/**
		 * Проверяет, изменились ли поля объекта страницы.
		 * @protected
		 * @return {Boolean} Возвращает true если есть изменения в значениях колонок схемы страницы,
		 * false - в обратном случае.
		 */
		isChanged: function() {
			var result = false;
			Terrasoft.each(this.changedValues, function() {
				var changedColumnName = arguments[1];
				result = !Ext.isEmpty(this.findEntityColumn(changedColumnName));
				return !result;
			}, this);
			return result;
		},

		/**
		 * Формирует запрос для сохранения элемента.
		 * @private
		 * @return {Terrasoft.InsertQuery} Запрос на сохранение.
		 */
		getSaveQuery: function() {
			var entitySchema = this.entitySchema;
			if (entitySchema == null) {
				throw new Terrasoft.exceptions.ArgumentNullOrEmptyException({argumentName: "entitySchema"});
			}
			if (this.isDeleted) {
				throw Terrasoft.InvalidOperationException();
			}
			var query = null;
			if (this.isNew) {
				query = this.getInsertQuery();
			} else {
				query = this.getUpdateQuery();
				query.enablePrimaryColumnFilter(this.get(this.primaryColumnName));
			}
			var columnValues = query.columnValues;
			columnValues.clear();
			for (var columnName in this.changedValues) {
				var column = this.columns[columnName];
				if (!column || column.type !== Terrasoft.ViewModelColumnType.ENTITY_COLUMN) {
					continue;
				}
				var columnPath = column.columnPath;
				if (!entitySchema.isColumnExist(columnPath)) {
					continue;
				}
				var columnValue = this.get(columnName);
				if (column.isLookup && columnValue) {
					columnValue = columnValue.value;
				}
				columnValues.setParameterValue(columnPath, columnValue, this.getColumnDataType(columnName));
			}
			return query;
		},

		/**
		 * Загружает модуль поиска контакта в соц. сетях.
		 * @private
		 * @param {Object} config Конфигурация модуля поиска в соцю сетях.
		 */
		loadSocialNetworksModule: function(config) {
			var historyState = this.sandbox.publish("GetHistoryState");
			this.sandbox.publish("PushHistoryState", {
				hash: historyState.hash.historyState,
				silent: true
			}, [this.sandbox.id]);
			this.sandbox.loadModule("FindContactsInSocialNetworksModule", {
				renderTo: "centerPanel",
				id: this.sandbox.id + "_FindContactsInSocialNetworksModule",
				keepAlive: true
			});
			this.sandbox.subscribe("ResultSelectedRows", function(args) {
				this.set("Number", args.name);
				this.set("SocialMediaId", args.id);
			}, this, [this.sandbox.id + "_FindContactsInSocialNetworksModule"]);
			this.sandbox.subscribe("SetInitialisationData", function() {
				return config;
			}, [this.sandbox.id + "_FindContactsInSocialNetworksModule"]);
		},

		/**
		 * Формирует запрос для выборки данных.
		 * @private
		 * @return {Terrasoft.EntitySchemaQuery} Экземпляр EntitySchemaQuery.
		 */
		getSelectQuery: function() {
			var entitySchemaQuery = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: this.get("DetailColumnName")
			});
			entitySchemaQuery.addColumn("Id");
			entitySchemaQuery.addColumn("Name");
			return entitySchemaQuery;
		},

		/**
		 * Возвращяет количество аккаунтов для синхронизации с переданной социальной сетью.
		 * @throws Terrasoft.QueryExecutionException Если при запросе возникла ошибка, генерируется исключительная
		 * ситуация.
		 * @param {Object} socialNetworkType Тип социальной сети, справочное значение.
		 * @param {Function} callback Функция обратного вызова, которая вызывается по завершении проверки.
		 * @param {Function} callback.accountsCount Количество аккаунтов синхронизации.
		 * @param {Object} scope Контекст выполнения переданной функции обратного вызова.
		 */
		getSocialNetworkAccountsCount: function(socialNetworkType, callback, scope) {
			var entitySchemaQuery = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "SocialAccount"
			});
			var resultColumnName = "accountsCount";
			entitySchemaQuery.addAggregationSchemaColumn("Id", Terrasoft.AggregationType.COUNT, resultColumnName);
			var filterGroup = Ext.create("Terrasoft.FilterGroup");
			filterGroup.logicalOperation = Terrasoft.LogicalOperatorType.OR;
			filterGroup.addItem(Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, "Public", true));
			var publicAccountFilterGroup = Ext.create("Terrasoft.FilterGroup");
			publicAccountFilterGroup.logicalOperation = Terrasoft.LogicalOperatorType.AND;
			publicAccountFilterGroup.addItem(Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, "Public", false));
			publicAccountFilterGroup.addItem(Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, "User", Terrasoft.SysValue.CURRENT_USER.value));
			filterGroup.addItem(publicAccountFilterGroup);
			var filters = entitySchemaQuery.filters;
			filters.add("socialNetworkTypeFilter", Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, "Type", socialNetworkType.value));
			filters.add("availableAccounts", filterGroup);
			entitySchemaQuery.getEntityCollection(function(result) {
				if (result.success) {
					var resultViewModel = result.collection.getByIndex(0);
					var accountsCount = resultViewModel.get(resultColumnName);
					callback.call(scope, accountsCount);
				} else {
					throw new Terrasoft.QueryExecutionException();
				}
			}, this);
		},

		/**
		 * Проверяет является ли значение поля допустимым адресом E-mail.
		 * @param {String} value Проверяемое значение.
		 * @return {Object} Объект сообщений ошибки.
		 */
		validateField: function(value) {
			var invalidMessage = "";
			var communicationType = this.get("CommunicationType");
			if (communicationType) {
				if (CommunicationUtils.isEmailType(communicationType.value) && !Ext.isEmpty(value) &&
						!EmailHelper.isEmailAddress(value)) {
					invalidMessage = resources.localizableStrings.WrongEmailFormat;
				} else if (CommunicationUtils.isPhoneType(communicationType.value) && !Ext.isEmpty(value) &&
						!this.isPhoneNumber(value)) {
					invalidMessage = resources.localizableStrings.WrongPhoneFormat;
				} else if (CommunicationUtils.isSkypeType(communicationType.value) && !Ext.isEmpty(value) &&
						!this.isSkypeAddress(value)) {
					invalidMessage = resources.localizableStrings.WrongSkypeFormat;
				}
			}
			return {
				fullInvalidMessage: invalidMessage,
				invalidMessage: invalidMessage
			};
		},

		/**
		 * Выполняет валидацию номера телефона.
		 * @param {String} value Проверяемое значение.
		 * @return {Boolean} true если введен валидный номер телефона.
		 */
		isPhoneNumber: function(value) {
			var phonePattern = /^[^'|^`]*$/;
			return phonePattern.test(value);
		},

		/**
		 * Выполняет валидацию адреса Skype.
		 * @param {String} value Проверяемое значение.
		 * @return {Boolean} true если введен валидный адрес Skype.
		 */
		isSkypeAddress: function(value) {
			var skypePattern = /^[^'|^`]*$/;
			return skypePattern.test(value);
		},

		/**
		 * Обновляет конфигурацию гиперссылки элемента управления.
		 * @param {String} value Значение заголовка гиперссылки.
		 * @return {String} Значение заголовка гиперссылки.
		 */
		updateLinkUrl: function(value) {
			this.set("Link", this.getLinkUrl(value));
			return value;
		},

		/**
		 * Получает конфигурацию гиперссылки элемента управления.
		 * @param {String} value Значение заголовка гиперссылки.
		 * @virtual
		 * @return {Object} Объект ссылки.
		**/
		getLinkUrl: function(value) {
			if (!value || Ext.isEmpty(value)) {
				return {};
			}
			var communicationType = this.get("CommunicationType");
			if (!communicationType) {
				return {};
			}
			if (CommunicationUtils.isWebType(communicationType.value)) {
				var regHttp = /(https?|ftp):(\/\/|\\\\)/gim;
				var nMatch = value.search(regHttp);
				if (nMatch >= 0) {
					return {
						url: value,
						caption: value
					};
				}
				return {
					url: "http://" + value,
					caption: value
				};
			}
			if (CommunicationUtils.isEmailType(communicationType.value) && value) {
				var emailUrl = EmailHelper.getEmailUrl(value);
				if (Ext.isEmpty(emailUrl)) {
					return {};
				}
				return {
					url: emailUrl,
					caption: value
				};
			}
			return {};
		},

		/**
		 * Получает конфигурацию изображения для иконки кнопки типа.
		 * @protected
		 * @return {Object} Конфигурация изображения для кнопки элемента управления.
		 */
		getTypeImageConfig: function() {
			var communicationType = this.get("CommunicationType");
			if (!communicationType) {
				return null;
			}
			if (CommunicationUtils.isWebType(communicationType.value)) {
				return resources.localizableImages.WebIcon;
			} else if (CommunicationUtils.isEmailType(communicationType.value)) {
				return resources.localizableImages.EmailIcon;
			}
			return null;
		},

		/**
		 * Обрабатывает нажатие на гиперссылку елемента управления.
		 * @protected
		 */
		onLinkClick: function(path) {
			if (!this.validate()) {
				return false;
			}
			var communicationType = this.get("CommunicationType");
			if (!communicationType) {
				return false;
			}
			if (CommunicationUtils.isWebType(communicationType.value)) {
				window.open(path);
			}
			if (CommunicationUtils.isEmailType(communicationType.value)) {
				window.location.href = path;
			}
			return false;
		},

		/**
		 * Обрабатывает нажатие на иконку кнопки типа елемента управления.
		 * @protected
		 */
		onTypeIconButtonClick: function() {
			var value = this.get("Number");
			if (value) {
				var path = this.getLinkUrl(value);
				if (path) {
					this.onLinkClick(path.url);
				}
			}
		},

		/**
		 * Устанавливает значение измения полей объекта в true.
		 */
		setIsChanged: function() {
			this.set("IsChanged", true);
		},

		/**
		 * Формирует текст подсказки для кнопки.
		 * @return {String} Текст подсказки для кнопки.
		 */
		getTypeIconButtonHintText: function() {
			return "";
		},

		/**
		 * Получает признак видимости иконки кнопки типа средства связи.
		 * @protected
		 * @return {Boolean} Признак видимости иконки кнопки типа средства связи.
		 */
		getTypeIconButtonVisibility: function() {
			var communicationType = this.get("CommunicationType");
			if (!communicationType) {
				return true;
			}
			var type = communicationType.value;
			return (CommunicationUtils.isWebType(type) || CommunicationUtils.isEmailType(type));
		},

		/**
		 * Возвращает маркер для кнопки справа от средства связи.
		 * protected
		 * @return {String} Маркер для кнопки справа от средства связи.
		 */
		getIconTypeButtonMarkerValue: function() {
			var communicationTypeDisplayValue = "";
			var communicationNumber = this.get("Number");
			var communicationType = this.get("CommunicationType");
			if (communicationType) {
				communicationTypeDisplayValue = communicationType.displayValue;
			}
			var markerValue = Ext.String.format("{0} {1}", communicationNumber, communicationTypeDisplayValue);
			return markerValue;
		},

		/**
		 * @obsolete
		 */
		onLookUpClick: function() {
			var entityName = this.get("DetailColumnName");
			var primaryLookupValue = this.get(entityName);
			var socialNetworkType = this.get("CommunicationType");
			var socialNetworkName = socialNetworkType.displayValue;
			var socialNetworksModuleConfig = {
				entitySchemaName: entityName,
				mode: "choice",
				recordId: primaryLookupValue.value,
				recordName: this.get("Number"),
				socialNetwork: socialNetworkName
			};
			this.getSocialNetworkAccountsCount(socialNetworkType, function(accountsCount) {
				if (accountsCount === 0) {
					this.handleMissingSocialNetworkAccount(socialNetworkName);
					return;
				}
				if (socialNetworksModuleConfig.recordName) {
					this.loadSocialNetworksModule(socialNetworksModuleConfig);
				} else {
					var entitySchemaQuery = this.getSelectQuery();
					entitySchemaQuery.getEntity(primaryLookupValue.value, function(result) {
						if (result.success && result.entity) {
							socialNetworksModuleConfig.recordName = result.entity.get("Name");
						}
						this.loadSocialNetworksModule(socialNetworksModuleConfig);
					}, this);
				}
			}, this);
		},

		handleMissingSocialNetworkAccount: function(socialNetworkName) {
			var message = Terrasoft.getFormattedString(resources.localizableStrings.NoSynchronizationAccont,
					socialNetworkName);
			Terrasoft.showInformation(message);
		},

		/**
		 * Возвращает видимость пункта меню.
		 * protected
		 * @return {Boolean} Видимость пункта меню.
		 */
		getMenuItemVisibility: function() {
			return true;
		}
	});
});
