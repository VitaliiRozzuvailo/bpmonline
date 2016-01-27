define("NotesUtilities", ["terrasoft", "NotesUtilitiesResources", "ConfigurationFileApi"],
		function(Terrasoft, resources) {
	var NotesUtilitiesClass = Ext.define("Terrasoft.configuration.mixins.NotesUtilities", {
		alternateClassName: "Terrasoft.NotesUtilities",

		/**
		 * Сохраняет изображения в БД.
		 * @private
		 * @param {Array} files Файлы.
		 */
		insertImagesToNotes: function(files) {
			this.Terrasoft.each(files, function(file) {
				this.addImageToNotes(file);
			}, this);
		},

		/**
		 * Возвращает параметры загрузки файлов.
		 * @private
		 * @param {Array} files Файлы.
		 * @return {Object} Параметры загрузки файлов.
		 */
		getImagesUploadConfig: function(files) {
			var fileEntitySchemaName = this.getFileEntitySchemaName();
			return {
				columnName: "Data",
				entitySchemaName: fileEntitySchemaName,
				files: files,
				isChunkedUpload: true,
				onUpload: this.onNotesImagesUpload,
				onComplete: this.onNotesImagesUploadComplete,
				onFileComplete: this.onNotesImageUploadComplete,
				parentColumnName: this.entitySchema.name,
				parentColumnValue: this.get("Id"),
				scope: this
			};
		},

		/**
		 * Обработчик события завершения загрузки файла.
		 * @private
		 * @param {Boolean|String} error False, при отсутствии ошибки, иначе текст ошибки.
		 * @param {Object} xhr Запрос.
		 * @param {Object} file Файл.
		 */
		onNotesImageUploadComplete: function(error, xhr, file) {
			if (!error) {
				this.addImageToNotes(file);
			}
		},

		/**
		 * Возвращает элемент коллекции изображений. Значениями являются название файла и адрес.
		 * @private
		 * @param {String} fileName Название файла.
		 * @param {String} url Адрес.
		 * @return {Terrasoft.BaseViewModel} Элемент коллекции изображений.
		 */
		getNotesImagesCollectionItem: function(fileName, url) {
			return this.Ext.create("Terrasoft.BaseViewModel", {
				values: {
					fileName: fileName,
					url: url
				}
			});
		},

		/**
		 * Добавляет файл в коллекцию изображений в примечаниях.
		 * @private
		 * @param {Object} file Файл.
		 */
		addImageToNotes: function(file) {
			FileAPI.readAsDataURL(file, function(event) {
				if (event.type !== "load") {
					return;
				}
				var imagesCollection = this.get("NotesImagesCollection");
				var image = this.getNotesImagesCollectionItem(event.target.name, event.result);
				imagesCollection.addItem(image);
			}.bind(this));
		},

		/**
		 * Задает вопрос пользователю о необходимости сохранить запись перед загрузкой изображений.
		 * @private
		 */
		promtSaveRecordBeforeImagesUpload: function() {
			var message = resources.localizableStrings.SaveRecordBeforeImageInsert;
			this.showConfirmationDialog(message, function(returnCode) {
				if (returnCode === this.Terrasoft.MessageBoxButtons.NO.returnCode) {
					return;
				}
				this.save({
					isSilent: true,
					callback: this.insertImagesAfterRecordSaved,
					scope: this
				});
			}, [this.Terrasoft.MessageBoxButtons.YES.returnCode, this.Terrasoft.MessageBoxButtons.NO.returnCode]);
		},

		/**
		 * Загружает изображения после сохранения новой записи.
		 * @private
		 * @param {Object} response Результат сохранения записи.
		 */
		insertImagesAfterRecordSaved: function(response) {
			var config = this.get("ImagesUploadConfig");
			this.Terrasoft.ConfigurationFileApi.upload(config);
			this.sendSaveCardModuleResponse(response.success);
		},

		/**
		 * Загружает изображения на деталь Файлы и ссылки раздела и добавляет в примечания.
		 * Если в разделе отсутствует объект детали, сразу добавляет изображения.
		 * @private
		 * @param {Array} images Изображения.
		 */
		uploadImages: function(images) {
			var config = this.getImagesUploadConfig(images);
			var isNewRecord = (this.isAddMode() || this.isCopyMode());
			if (isNewRecord) {
				this.set("ImagesUploadConfig", config);
				this.promtSaveRecordBeforeImagesUpload();
			} else {
				this.Terrasoft.ConfigurationFileApi.upload(config);
			}
		},

		/**
		 * Инициализирует коллекцию для изображений, добавляемых в редактор примечаний.
		 */
		initNotesImagesCollection: function() {
			this.set("NotesImagesCollection", this.Ext.create("Terrasoft.BaseViewModelCollection"));
		}
	});
	return Ext.create(NotesUtilitiesClass);
});
