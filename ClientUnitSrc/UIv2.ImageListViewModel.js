define("ImageListViewModel", ["BaseGridRowViewModel"],
		function() {
	Ext.define("Terrasoft.configuration.ImageListViewModel", {
		alternateClassName: "Terrasoft.ImageListViewModel",
		extend: "Terrasoft.BaseGridRowViewModel",

		Ext: null,
		sandbox: null,
		Terrasoft: null,

		/**
		 * Идентификатор объекта.
		 */
		entityId: null,

		/**
		 * Признак, который указывает на то, что сущность - ссылка.
		 * @readonly
		 * @type {Boolean}
		 */
		isLink: false,

		/**
		 * Признак, который указывает на то, что сущность - файл.
		 * @readonly
		 * @type {Boolean}
		 */
		isFile: false,

		/**
		 * Признак, который указывает на то, что сущность - ссылка на объект.
		 * @readonly
		 * @type {Boolean}
		 */
		isEntityLink: false,

		/**
		 * Обработчик нажатия на изображение.
		 * @private
		 */
		onEntityImageClick: Terrasoft.emptyFn,

		/**
		 * @inheritDoc FileDetailV2#getEntityLinkConfigById
		 * @overridden
		 */
		getEntityLinkConfigById: Terrasoft.emptyFn,

		/**
		 * @inheritDoc FileDetailV2#openCardEntity
		 * @overridden
		 */
		openCardEntity: Terrasoft.emptyFn,

		/**
		 * @inheritDoc FileDetailV2#defineEntityType
		 * @overridden
		 */
		defineEntityType: Terrasoft.emptyFn,

		/**
		 * @inheritDoc FileDetailV2#setDefaultEntityType
		 * @overridden
		 */
		setDefaultEntityType: Terrasoft.emptyFn,

		/**
		 * @inheritDoc FileDetailV2#getSysSettingImageByEntityName
		 * @overridden
		 */
		getSysSettingImageByEntityName: Terrasoft.emptyFn,

		/**
		 * @inheritDoc Terrasoft.BaseViewModel#constructor
		 * @overridden
		 */
		constructor: function() {
			this.callParent(arguments);
			this.on("change:Name", this.onNameChanged, this);
			this.initPropertyValue();
		},

		/**
		 * Обрабатывает событие изменения значения колонки "Название".
		 * @private
		 */
		onNameChanged: function() {
			if (this.mode === "tiled") {
				this.insertEntityLink();
			}
		},

		/**
		 * Инициализация данных.
		 */
		initPropertyValue: function() {
			this.entityId = this.get("Id");
		},

		/**
		 * Признак множественного выбора.
		 * @private
		 * @return {Boolean} Признак отвечающий за видимость checkbox'а.
		 */
		getIsMultiSelect: function() {
			return this.isMultiSelect;
		},

		/**
		 * Обработчик события "dataLoaded" коллекции Terrasoft.Collection
		 * @protected
		 * @param {Object} items
		 * @param {Object} newItems
		 */
		onCollectionDataLoaded: function(items, newItems) {
			this.observableRowHistory = [];
			this.selectableRows = null;
			items = newItems || items;
			if (items && items.getCount() > 0) {
				this.addItems(items.getItems());
			}
		},

		/**
		 * Обработчик выбора изображения.
		 * Помещает идентификаторы отмеченных изображений в массив.
		 * @param {Boolean} checked Флаг, указывающий, выбрано ли изображение.
		 */
		onSelectItem: function(checked) {
			var detail = this.detail;
			var detailSelectedRows = detail.get("SelectedRows");
			var selectedRows = this.Terrasoft.deepClone(detailSelectedRows);
			var itemId = this.get("Id");
			var itemIndex = selectedRows.indexOf(itemId);
			if (checked && (itemIndex === -1)) {
				selectedRows.push(itemId);
			} else if (!checked && (itemIndex !== -1)) {
				selectedRows.splice(itemIndex, 1);
			}
			detail.set("SelectedRows", selectedRows);
		},

		/**
		 * Возращает информацию о том выбрано текущее изображение, или нет.
		 * @private
		 * @return {Boolean} Информация о том выбрано текущее изображение, или нет.
		 */
		getCheckItems: function() {
			var itemId = this.get("Id");
			var selectedRows = this.detail.get("SelectedRows");
			if (!selectedRows) {
				return false;
			}
			var indexOfItem = selectedRows.indexOf(itemId);
			return indexOfItem !== -1;
		},

		/**
		 * Выполняет пост обработку отрисовки элемента.
		 * Добавляет ссылку на элемент.
		 * @private
		 */
		insertEntityLink: function() {
			var entityText = this.getEntityText();
			var href = "";
			var target = "";
			if (this.isFile) {
				href = this.Terrasoft.workspaceBaseUrl + "/rest/FileService/GetFile/" + this.entitySchema.uId + "/" +
					this.entityId;
				target = "_self";
			}
			if (this.isLink) {
				href = entityText.match(/(?:https?|ftp):\/\//i) === null ? "http://" + entityText : entityText;
				target = "_blank";
			}
			if (this.isEntityLink) {
				var config = this.getEntityLinkConfigById(this.entityId);
				href = config.url;
			}
			var linkHtmlConfig = this.Ext.DomHelper.createHtml({
				tag: "a",
				target: target,
				html: Terrasoft.utils.common.encodeHtml(entityText),
				href: href
			});
			var container = this.getLinkContainer();
			if (this.isEntityLink) {
				container.wrapEl.el.on("click", this.onClickEntityLink, this);
			}
			container.wrapEl.update(linkHtmlConfig);
		},

		/**
		 * Возвращает контейнет ссылки.
		 * @return {Ext.Component}
		 */
		getLinkContainer: function() {
			var containerId = "entity-link-container-" + this.entityId + "-" + this.sandbox.id;
			return this.Ext.getCmp(containerId);
		},

		/**
		 * Обрабтчик клика кнопки.
		 * @protected
		 * @param {Event} event
		 */
		onClickEntityLink: function(event) {
			event.stopEvent();
			this.openCardEntity(this.entityId);
		},

		/**
		 * Возвращает ссылку на изображение.
		 * @private
		 * @return {String} Ссылка на изображение.
		 */
		getEntityImage: function() {
			this.defineEntityType(this);
			var imageUrl = this.get("imageUrl");
			var imageId = this.get("Id");
			return imageUrl ? imageUrl : this.getImageUrl(this.entitySchema.name, imageId);
		},

		/**
		 * Возвращает Url на изображение.
		 * @overridden
		 * @param {String} entitySchemaName Название сущности.
		 * @param {String} Id Идентификатор изображения.
		 * @return {String} Ссылка на изображение.
		 */
		getImageUrl: function(entitySchemaName, Id) {
			if (this.isEntityLink) {
				var entity = this.getEntityLinkCacheById(Id);
				return Terrasoft.ImageUrlBuilder.getUrl({
					source: Terrasoft.ImageSources.SYS_SETTING,
					params: {
						r: this.getSysSettingImageByEntityName(entity.entityName)
					}
				});
			} else {
				return Terrasoft.ImageUrlBuilder.getUrl({
					source: Terrasoft.ImageSources.ENTITY_COLUMN,
					params: {
						schemaName: entitySchemaName,
						columnName: "Data",
						primaryColumnValue: Id
					}
				});
			}
		},

		/**
		 * Возвращает подпись изображения.
		 * @private
		 * @return {String} Подпись изображения.
		 */
		getEntityText: function() {
			var entityText = this.get("Name");
			return entityText ? entityText : "";
		},

		/**
		 * @obsolete
		 */
		getEntityImageVisible: function() {
			return true;
		},

		/**
		 * @inheritDoc Terrasoft.Component#onDestroy
		 */
		onDestroy: function() {
			var container = this.getLinkContainer();
			if (container) {
				container.wrapEl.el.un("click", this.onClickEntityLink, this);
			}
			this.callParent(arguments);
		}
	});
});
