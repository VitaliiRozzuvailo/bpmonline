define("CallSectionGridRowViewModel", ["CallSectionGridRowViewModelResources", "CtiConstants",
		"BaseSectionGridRowViewModel"],
	function(resources, ctiConstants) {

		/**
		 * @class Terrasoft.configuration.QueueGridRowViewModel
		 * Класс модели представления строки раздела "Звонки".
		 */
		Ext.define("Terrasoft.configuration.CallSectionGridRowViewModel", {
			extend: "Terrasoft.BaseSectionGridRowViewModel",
			alternateClassName: "Terrasoft.CallSectionGridRowViewModel",

			Ext: null,

			Terrasoft: null,

			sandbox: null,

			/**
			 * Ссылка на элемент-обертку компонента аудиоплеера.
			 * @type {Ext.Element}
			 */
			player: null,

			columns: {

				/**
				 * Признак состояния проигрывания аудиопотока.
				 * @type {Boolean}
				 */
				"IsPlaying": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: false
				},

				/**
				 * Признак возможности проигрывать запись звонка.
				 * @type {Boolean}
				 */
				"IsRecordPlayAvailable": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: false
				},

				/**
				 * Url аудиопотока.
				 * @type {String}
				 */
				"SourceUrl": {
					dataValueType: Terrasoft.DataValueType.TEXT,
					value: ""
				}
			},

			//region Methods: Private

			/**
			 * Возвращает ссылку на элемент-обертку компонента аудиоплеера.
			 * @private
			 * @returns {Ext.Element} Ссылка на элемент-обертку.
			 */
			getPlayer: function() {
				var recordId = this.get("Id");
				var queryElements = Ext.query("audio[sourceid='" + recordId + "']");
				if (!queryElements) {
					return null;
				}
				var playerElement = Ext.isArray(queryElements) ? queryElements[0] : queryElements;
				var playerId = playerElement.getAttribute("id");
				return Ext.getCmp(playerId);
			},

			//endregion

			//region Methods: Public

			/**
			 * Возвращает идентификатор аудиопотока.
			 * @returns {String} Идентификатор аудиопотока.
			 */
			getSourceId: function() {
				return this.get("Id");
			},

			/**
			 * Запрашивает записи разговоров.
			 */
			requestCallRecords: function() {
				var args = {
					callId: this.get("IntegrationId"),
					callback: this.onGetCallRecords.bind(this)
				};
				this.sandbox.publish("GetCallRecords", args, [ctiConstants.CallRecordsContextMessageId]);
			},

			/**
			 * Возвращает заголовок кнопки проигрывания записи.
			 * @returns {String} Заголовок кнопки.
			 */
			getPlayerButtonCaption: function() {
				var isPlaying = this.get("IsPlaying");
				if (isPlaying) {
					return resources.localizableStrings.StopCaption;
				}
				return resources.localizableStrings.PlayCaption;
			},

			/**
			 * Возвращает конфигурацию иконки кнопки проигрывания записи.
			 * @returns {Object} Конфигурацию иконки.
			 */
			getPlayerButtonImageConfig: function() {
				var isPlaying = this.get("IsPlaying");
				if (isPlaying) {
					return resources.localizableImages.StopImage;
				}
				return resources.localizableImages.PlayImage;
			},

			/**
			 * Обрабатывает событие окончания воспроизведения записи.
			 */
			onPlaybackEnded: function() {
				this.set("IsPlaying", false);
			},

			/**
			 * Обрабатывает событие ошибки при воспроизведении записи.
			 * @protected
			 * @param {Number} errorCode Код ошибки.
			 */
			onPlayError: function(errorCode) {
				this.set("IsPlaying", false);
				this.error(Ext.String.format(resources.localizableStrings.PlayErrorMessage, errorCode));
			},

			/**
			 * Обрабатывает событие получения записей разговоров.
			 * @param {Boolean} canGetCallRecords Признак, что есть возможность получать записи
			 * разговоров звонка.
			 * @param {String[]} callRecords Массив ссылок на записи разговоров звонка.
			 */
			onGetCallRecords: function(canGetCallRecords, callRecords) {
				if (!canGetCallRecords || !Ext.isArray(callRecords) || (callRecords.length === 0)) {
					this.set("IsRecordPlayAvailable", false);
					return;
				}
				var callRecordUrl = callRecords[0];
				if (Ext.isEmpty(callRecordUrl)) {
					this.set("IsRecordPlayAvailable", false);
					return;
				}
				this.set("IsRecordPlayAvailable", true);
				this.set("SourceUrl", callRecordUrl);
			},

			/**
			 * Обрабатывает событие нажатия кнопки проигрывания записи.
			 */
			onRecordPlayerClick: function() {
				var isPlaying = this.get("IsPlaying");
				this.set("IsPlaying", !isPlaying);
				if (isPlaying) {
					this.player.stop();
					return;
				}
				var player = this.getPlayer();
				if (!player) {
					this.set("IsPlaying", !isPlaying);
					return;
				}
				this.player = player;
				this.player.play();
			}

			//endregion

		});
	});