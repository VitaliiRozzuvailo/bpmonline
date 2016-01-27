define("ContentBuilderEnums", function() {
		return {
			/**
			 * @enum
			 * Режим дизайнера контента.
			 */
			ContentBuilderMode: {
				/* Email-рассылка */
				BULKEMAIL: "BuilEmail",
				/* Шаблон email сообщения */
				EMAILTEMPLATE: "EmailTemplate"
			},

			/**
			 * @string
			 * Префикс url-адреса дизайнера контента.
			 */
			BasePath: "/Nui/ViewModule.aspx?vm=BaseViewModule#ConfigurationModuleV2/",

			/**
			 * Возвращает параметры дизайнера контента.
			 * @param {Object} mode Режим дизайнера контента.
			 * @returns {Object}
			 */
			GetContentBuilderConfig: function (mode) {
				var contentBuilderModeConfig = {};
				contentBuilderModeConfig[this.ContentBuilderMode.BULKEMAIL] = {
					"EntitySchemaName": "BulkEmail",
					"TemplateConfigColumnName": "TemplateConfig",
					"TemplateBodyColumnName": "TemplateBody",
					"ViewModelName": "EmailContentBuilder"
				};
				contentBuilderModeConfig[this.ContentBuilderMode.EMAILTEMPLATE] = {
					"EntitySchemaName": "EmailTemplate",
					"TemplateConfigColumnName": "TemplateConfig",
					"TemplateBodyColumnName": "Body",
					"ViewModelName": "EmailContentBuilder"
				};
				return contentBuilderModeConfig[mode];
			},

			/**
			 * Возвращает url-адрес дизайнера контента с параметрами.
			 * @param {Object} mode Режим дизайнера контента.
			 * @param {Guid} recordId Уникальный идентификатор записи.
			 * @returns {String} Url-адрес дизайнера контента.
			 */
			GetContentBuilderUrl: function(mode, recordId) {
				var contentBuilderConfig = this.GetContentBuilderConfig(mode);
				return Ext.String.format("{0}{1}{2}/{3}/{4}",
					Terrasoft.workspaceBaseUrl,
					this.BasePath,
					contentBuilderConfig.ViewModelName,
					recordId,
					mode);
			}
		};
	});
