define("TagItemViewModel", ["TagItemViewModelResources", "TagConstantsV2", "css!TagModuleSchemaStyles"],
	function(resources, TagConstants) {
		/**
		 * @class Terrasoft.configuration.TagItemViewModel
		 */
		Ext.define("Terrasoft.configuration.TagItemViewModel", {
			extend: "Terrasoft.BaseViewModel",
			alternateClassName: "Terrasoft.TagItemViewModel",

			Ext: null,
			Terrasoft: null,
			sandbox: null,

			/**
			 * Инициализация событий элемента тега.
			 * @protected
			 */
			init: function() {
				this.addEvents(
					/**
					 * @event
					 * Событие удаления тега.
					 * @param {Object} viewModel Модель представления тега.
					 */
					"entityInTagDeleted"
				);
			},

			/**
			 * Формирует запрос на удаление тега в записи раздела.
			 * @private
			 * @returns {Terrasoft.DeleteQuery} запрос на удаление записи
			 */
			getDeleteQuery: function() {
				var deleteQuery = this.Ext.create("Terrasoft.DeleteQuery", {
					rootSchemaName: this.get("InTagSchemaName")
				});
				deleteQuery.filters.add(this.Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "Id", this.get("Id")
				));
				return deleteQuery;
			},

			/**
			 * Обработчик клика по иконке "Удалить тег" в кнопке тега.
			 * Удаляет тег из текущей активной записи.
			 * @protected
			 */
			onRemoveTagFromEntityImageClick: function() {
				if (this.Terrasoft.CurrentUser.userType !== this.Terrasoft.UserType.SSP) {
					this.deleteTag();
				} else if (this.Terrasoft.CurrentUser.userType === this.Terrasoft.UserType.SSP &&
					this.get("TagTypeId") === TagConstants.TagType.Public) {
					this.showInformationDialog(resources.localizableStrings.CannotDeleteTagMessage);
				} else {
					this.deleteTag();
				}
			},

			/**
			 * Удаляет тег из записи, и информирует модуль об успешном удалении тега.
			 * @private
			 */
			deleteTag: function() {
				var deleteQuery = this.getDeleteQuery();
				deleteQuery.execute(function(response) {
					if (response.success) {
						this.fireEvent("entityInTagDeleted", this);
					}
				}, this);
			},

			/**
			 * Обработчик клика по тегу.
			 * Формирует сообщение и устанавливает фильтр по тегу, в разделе.
			 */
			onTagItemButtonClick: function() {
				//TODO: #CRM-11301 Фильтрация в разделе при нажатии на тег в странице записи
			}
		});
		return Terrasoft.TagItemViewModel;
	});