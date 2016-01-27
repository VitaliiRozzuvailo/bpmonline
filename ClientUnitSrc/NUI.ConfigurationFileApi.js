/**
 * @class Terrasoft.configuration.ConfigurationFileApi
 * Класс ConfigurationFileApi предназначен для загрузки файлов на сервер и содержит один публичный метод upload.
 * При загрузки больших файлов на сервер файл разбивается на более мелкие части которые последовательно загружаются
 * на сервер
*/
define("ConfigurationFileApi", ["ext-base", "terrasoft", "MaskHelper", "ConfigurationFileApiResources"],
	function(Ext, Terrasoft) {
		Ext.define("Terrasoft.configuration.ConfigurationFileApi", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.ConfigurationFileApi",
			singleton: true,

			/**
			 * Размер передаваемой части файла в байтах. При загрузке, файл разбивается на несколько частей, которые
			 * загружаются последовательно.
			 * @type {Number}
			 * @private
			 */
			defaultChunkSize: 0.5 * FileAPI.MB,

			/**
			 * Количество попыток при загрузке файла частями.
			 * @type {Number}
			 * @private
			 */
			defaultChunkUploadRetry: 3,

			/**
			 * Путь к методу web-сервиса для загрузки файла.
			 * @private
			 */
			defaultWebServicePath: "FileApiService/Upload",

			/**
			 * Подготавливает параметры загрузки файла.
			 * @private
			 * @param {Object} file Файл.
			 * @param {Object} options Существующие параметры.
			 */
			onPrepare: function(file, options) {
				var data = options.data = options.data || {};
				var config = this.uploadConfig;
				Ext.apply(data, {
					totalFileLength: file.size,
					fileId: Terrasoft.generateGUID(),
					mimeType: file.type,
					entitySchemaName: config.entitySchemaName,
					columnName: config.columnName,
					fileName: file.name,
					parentColumnName: config.parentColumnName,
					parentColumnValue: config.parentColumnValue
				});
			},

			/**
			 * Обработчик события старта загрузки файлов.
			 * @private
			 * @param {Object} xhr Запрос.
			 * @param {Object} options Параметры загрузки файлов.
			 */
			onUpload: function(xhr, options) {
				this.processResult("onUpload", arguments);
			},

			/**
			 * Обработчик события старта загрузки файла.
			 * @private
			 * @param {Object} file Файл.
			 * @param {Object} xhr Запрос.
			 * @param {Object} options Параметры загрузки файла.
			 */
			onFileUpload: function(file, xhr, options) {
				this.processResult("onFileUpload", arguments);
			},

			/**
			 * Обработчик события прогресса загрузки файлов.
			 * @private
			 * @param {Object} event XMLHttpRequestProgressEvent.
			 * @param {Object} file Файл.
			 * @param {Object} xhr Запрос.
			 * @param {Object} options Параметры загрузки файлов.
			 * Например, получение процентного соотношения загруженных файлов: evt.loaded / evt.total * 100.
			 */
			onProgress: function(event, file, xhr, options) {
				this.processResult("onProgress", arguments);
			},

			/**
			 * Обработчик события прогресса загрузки файла.
			 * @private
			 * @param {Object} event XMLHttpRequestProgressEvent.
			 * @param {Object} file Файл.
			 * @param {Object} xhr Запрос.
			 * @param {Object} options Параметры загрузки файла.
			 * Например, получение процентного соотношения загружаемого файла: evt.loaded / evt.total * 100.
			 */
			onFileProgress: function(event, file, xhr, options) {
				this.processResult("onFileProgress", arguments);
			},

			/**
			 * Обработчик события завершения загрузки файлов.
			 * @private
			 * @param {Boolean|String} error False, при отсутствии ошибки, иначе текст ошибки.
			 * @param {Object} xhr Запрос.
			 * @param {Object} options Параметры загрузки файлов.
			 */
			onComplete: function(error, xhr, options) {
				this.processResult("onComplete", arguments);
				var uploadConfig = this.uploadConfig;
				var callback = uploadConfig.callback;
				if (callback) {
					callback.call(uploadConfig.scope);
				}
			},

			/**
			 * Обработчик события завершения загрузки файла.
			 * @private
			 * @param {Boolean|String} error False, при отсутствии ошибки, иначе текст ошибки.
			 * @param {Object} xhr Запрос.
			 * @param {Object} file Файл.
			 * @param {Object} options Параметры загрузки файлов.
			 */
			onFileComplete: function(error, xhr, file, options) {
				this.processResult("onFileComplete", arguments);
			},

			/**
			 * Обрабатывает события загрузки файлов. Если в параметрах загрузки есть соответствующий обработчик, он
			 * будет вызван.
			 * @private
			 * @param {String} eventName Название события.
			 * @param {Arguments} args Аргументы события.
			 */
			processResult: function(eventName, args) {
				var uploadConfig = this.uploadConfig;
				var handler = uploadConfig[eventName];
				if (handler) {
					handler.apply(uploadConfig.scope, args);
				}
			},

			/**
			 * Инициализирует события "drag" и "drop" контейнера.
			 * @param {Object} dropzone Контейнер.
			 * @param {Function} hoverHandler Обработчик событий "dragenter" и "dragleave".
			 * @param {Function} dropHandler Обработчик события "drop".
			 */
			initDropzoneEvents: function(dropzone, hoverHandler, dropHandler) {
				FileAPI.event.dnd(dropzone, hoverHandler, dropHandler);
			},

			/**
			 * Выполняет загрузку файлов на сервер.
			 * @param {Object} config Параметры загрузки файлов.
			 * @param {Object} config.scope Контекст вызова функций-обработчиков событий загрузки.
			 * @param {Function} config.onUpload Обработчик события старта загрузки файлов.
			 * @param {Function} config.onFileUpload Обработчик события старта загрузки файла.
			 * @param {Function} config.onProgress Обработчик события прогресса загрузки файлов.
			 * @param {Function} config.onFileProgress Обработчик события прогресса загрузки файла.
			 * @param {Function} config.onComplete Обработчик события завершения загрузки файлов.
			 * @param {Function} config.onFileComplete Обработчик события завершения загрузки файла.
			 * @param {String} config.entitySchemaName Название сущности загружаемых файлов.
			 * @param {String} config.columnName Название колонки данных.
			 * @param {String} config.parentColumnName Название колонки связи с родительской сущностью.
			 * @param {String} config.parentColumnValue Значение колонки связи с родительской сущностью.
			 * @param {Array} config.files Файлы.
			 * @param {Boolean} config.isChunkedUpload True, если необходимо выполнять загрузку по частям.
			 * @param {Function} [callback] (optional) Функция, которая будет вызвана после завершения загрузки.
			 */
			upload: function(config, callback) {
				if (config.file) {
					this.log(Ext.String.format(Terrasoft.Resources.ObsoleteMessages.ObsoletePropertyMessage, "file",
						"files"));
					config.files = [config.file];
				}
				if (!callback) {
					callback = Terrasoft.emptyFn;
				}
				config.callback = callback;
				var servicePath = config.uploadWebServicePath || this.defaultWebServicePath;
				var url = Terrasoft.combinePath(Terrasoft.workspaceBaseUrl, "rest", servicePath);
				var isChunkedUpload = config.isChunkedUpload;
				var fileApiUploadConfig = {
					url: url,
					data: {},
					headers: {},
					files: {files: config.files},
					chunkSize: isChunkedUpload ? config.chunkSize || this.defaultChunkSize : 0,
					chunkUploadRetry: isChunkedUpload ? config.chunkUploadRetry || this.defaultChunkUploadRetry : 0,
					prepare: this.onPrepare.bind(this),
					upload: this.onUpload.bind(this),
					fileupload: this.onFileUpload.bind(this),
					progress: this.onProgress.bind(this),
					fileprogress: this.onFileProgress.bind(this),
					complete: this.onComplete.bind(this),
					filecomplete: this.onFileComplete.bind(this)
				};
				this.uploadConfig = config;
				FileAPI.upload(fileApiUploadConfig);
			},

			/**
			 * Выполняет загрузку изображения в объект Blob.
			 * @param {Object} url Адрес изображения которое нужно загрузить.
			 * @param {Function} callback Функция, которой будет передано изображение в Blob объекте.
			 * @param {Object} scope Контекст вызова функции обратного вызова.
			 */
			getImageFile: function(url, callback, scope) {
				var xhr =  new XMLHttpRequest();
				xhr.open("GET", url);
				xhr.responseType = "blob";
				xhr.onload = function() {
					var blob = xhr.response;
					var newDate = new Date();
					Ext.apply(blob, {
						lastModified: newDate.valueOf(),
						lastModifiedDate: newDate.toString(),
						name: Terrasoft.generateGUID().toString(),
						webkitRelativePath: ""
					});
					callback.call(scope, blob);
				};
				xhr.send();
			}
		});
	});
