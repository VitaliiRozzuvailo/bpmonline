define("SocialGridDetailUtilities", [], function() {
	Ext.define("Terrasoft.configuration.mixins.SocialGridDetailUtilities", {
		alternateClassName: "Terrasoft.SocialGridDetailUtilities",

		/**
		 * Инициализирует начальное состояние детали обогащения из соц. сетей.
		 * @private
		 */
		initSocialDetail: function() {
			this.set("CanAdd", false);
		},

		/**
		 * Обработчик события загрузки данных из социальных сетей.
		 * @protected
		 * @param {Object} socialNetworkData Данные из социальных сетей.
		 */
		onSocialNetworkDataLoaded: function(socialNetworkData) {
			this.createSocialEntityDataRows({
				socialNetworkData: socialNetworkData,
				callback: this.addSocialEntityDataRows,
				scope: this
			});
		},

		/**
		 * Добавляет в реестр детали записи заполненные даными из соц. сети.
		 * @private
		 * @param {Object} socialEntityDataRows Коллекция объектов данных из соц. сети для
		 * наполнения новых записей редактируемого реестра детали.
		 */
		addSocialEntityDataRows: function(socialEntityDataRows) {
			if (!socialEntityDataRows) {
				return;
			}
			socialEntityDataRows.each(this.addSocialEntityDataRow, this);
		},

		/**
		 * Добавляет в реестр детали запись заполненную даными из соц. сети.
		 * @private
		 * @param {Object} socialEntityDataRow Объект данных из соц. сети для
		 * заполнения новой записи редактируемого реестра детали.
		 */
		addSocialEntityDataRow: function(socialEntityDataRow) {
			var id = Terrasoft.generateGUID();
			var typeColumnValue = null;
			var callback = function(row) {
				this.setSocialEntityDataRow({
					row: row,
					socialEntityDataRow: socialEntityDataRow,
					callback: this.addSocialNewRowToCollection,
					scope: this
				});
			};
			this.createNewRow(id, typeColumnValue, callback);
		},

		/**
		 * Заполняет соответствующие поля записи редактируемого реестра детали данными из соц. сети.
		 * @private
		 * @param {Object} config.row Запись редактируемого реестра детали.
		 * @param {Object} config.socialEntityDataRow Объект содержащий данные для заполнения записи реестра детали.
		 * @param {Object} config.callback Функция обратного вызова для дальнейшей обработки заполненной записи реестра.
		 * @param {Object} config.scope Контекст выполнения функции обратного вызова.
		 */
		setSocialEntityDataRow: function(config) {
			var row = config.row;
			var socialEntityDataRow = config.socialEntityDataRow;
			var columns = this.entitySchema.columns;
			this.Terrasoft.each(columns, function(column, columnName) {
				if (!this.Ext.isEmpty(socialEntityDataRow[columnName])) {
					row.set(columnName, socialEntityDataRow[columnName]);
				}
			}, this);
			var callback = config.callback;
			if (Ext.isFunction(callback)) {
				callback.call(config.scope || this, row);
			}
		},

		/**
		 * Добавляет новую редактируемую запись в коллекцию,
		 * но не устанавливает на ней курсор и не делает активной записью.
		 * @inheritdoc Terrasoft.ConfigurationGridUtilities#addNewRowToCollection
		 * @overridden
		 */
		addSocialNewRowToCollection: function(newRow) {
			var id = newRow.get("Id");
			var collection = this.Ext.create("Terrasoft.BaseViewModelCollection");
			collection.add(id, newRow);
			this.initIsGridEmpty(collection);
			this.addItemsToGridData(collection, {
				mode: "bottom"
			});
		},

		/**
		 * Возвращает коллекцию объектов данных из соц. сетей для добавления записей в реестр детали.
		 * @protected
		 * @virtual
		 * @param {Object} config.socialNetworkData Данные из социальных сетей.
		 * @param {Object} config.callback Функция обратного вызова.
		 * @param {Object} config.scope Контекст выполнения функции обратного вызова.
		 */
		createSocialEntityDataRows: Terrasoft.emptyFn,

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
				var collection = this.get("Collection");
				collection.each(function(item) {
					item.isNew = false;
					item.changedValues = null;
				}, this);
				this.publishSaveResponse(response);
			} else {
				this.publishSaveResponse({
					success: false,
					message: message
				});
			}
		},

		/**
		 * Сохраняет изменения детали. Срабатывает при нажатии на кнопку сохранить карточки, которая содержит
		 * деталь.
		 * @protected
		 * @return {Boolean} True если сохранение прошло успешно, или нет изменений для сохранения.
		 */
		save: function() {
			var queries = this.getChangeItemsQueries();
			if (this.Ext.isEmpty(queries)) {
				this.publishSaveResponse({success: true});
				return true;
			}
			var batchQuery = this.Ext.create("Terrasoft.BatchQuery");
			this.Terrasoft.each(queries, function(query) {
				batchQuery.add(query);
			}, this);
			batchQuery.execute(this.onSaved, this);
			return true;
		},

		/**
		 * Формирует массив запросов на изменение/добавление/удаление записей реестра.
		 * @protected
		 * @return {Array} Массив запросов на изменение/добавление/удаление записей реестра.
		 */
		getChangeItemsQueries: function() {
			var queries = [];
			var selectedItems = this.getSelectedItems();
			var collection = this.get("Collection");
			collection.each(function(item) {
				var itemId = item.get(item.primaryColumnName);
				var selected = this.Terrasoft.contains(selectedItems, itemId);
				if (selected) {
					if (item.isChanged() && item.validate()) {
						queries.push(item.getSaveQuery());
					}
				} else {
					if (!item.isNew) {
						var deleteQuery = item.getDeleteQuery();
						deleteQuery.enablePrimaryColumnFilter(itemId);
						queries.push(deleteQuery);
					}
				}
			}, this);
			return queries;
		},

		/**
		 * Публикует сообщение о том, что деталь сохранена.
		 * @protected
		 * @param {Object} config Параметры сообщения.
		 */
		publishSaveResponse: function(config) {
			this.sandbox.publish("DetailSaved", config, [this.sandbox.id]);
		},

		/**
		 * Выполняет валидацию детали.
		 * @protected
		 * @virtual
		 * @return {Boolean} Если деталь прошла валидацию возвращает true.
		 */
		validateDetail: function() {
			var invalidItems = this.getInvalidItems();
			var resultObject = {
				success: (invalidItems.length === 0)
			};
			if (!resultObject.success) {
				resultObject.message = this.get("Resources.Strings.InvalidAnniversaryMessage");
			}
			this.sandbox.publish("DetailValidated", resultObject, [this.sandbox.id]);
			return true;
		},

		/**
		 * Возвращает массив элементов, которые не прошли валидацию.
		 * @protected
		 * @return {Array} Массив элементов, которые не прошли валидацию.
		 */
		getInvalidItems: function() {
			var collection = this.get("Collection");
			var invalidItems = [];
			var selectedItems = this.getSelectedItems();
			var validationResult;
			collection.each(function(item) {
				var itemId = item.get(item.primaryColumnName);
				var selected = this.Terrasoft.contains(selectedItems, itemId);
				if (!selected) {
					return;
				}
				validationResult = this.getItemValidationResult(item);
				if (!validationResult.success) {
					invalidItems.push(validationResult);
					return false;
				}
			}, this);
			return invalidItems;
		},

		/**
		 * Возвращает результат валидации элемента.
		 * @private
		 * @param {Terrasoft.BaseCommunicationViewModel} item Проверяемый элемент.
		 * @return {Object} Результат валидации элемента.
		 */
		getItemValidationResult: function(item) {
			var validationResult = {
				success: true
			};
			if (item.isChanged() && !item.validate()) {
				var attributes = item.validationInfo.attributes;
				this.Terrasoft.each(attributes, function(attribute, attributeName) {
					if (!attribute.isValid) {
						var invalidColumn = item.columns[attributeName];
						validationResult = {
							success: false,
							invalidColumn: invalidColumn,
							item: item
						};
						return false;
					}
				}, this);
			}
			return validationResult;
		},

		/**
		 * Выбирает записи в реестре в режиме множественного выбора.
		 * @protected
		 * @param {Terrasoft.Collection} items Коллекция записей.
		 */
		selectRows: function(items) {
			var selectedRows = [].concat(this.getSelectedItems() || []);
			items.each(function(item) {
				var id = item.get(item.primaryColumnName);
				selectedRows.push(id);
			}, this);
			this.set("SelectedRows", selectedRows);
		}
	});
});
