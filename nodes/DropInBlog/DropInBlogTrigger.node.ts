import type {
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { API_BASE_URL } from './constants';
import { getBlogs } from './GenericFunctions';

export class DropInBlogTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DropInBlog Trigger',
		name: 'dropInBlogTrigger',
		icon: 'file:logo.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when a DropInBlog event occurs',
		defaults: {
			name: 'DropInBlog Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'dropInBlogOAuth2Api',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Blog',
				name: 'blogId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getBlogs',
				},
				required: true,
				default: '',
				description:
					'The blog to listen for events from. Choose from the list.',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				default: 'post.published',
				options: [
					{
						name: 'Post Published',
						value: 'post.published',
						description: 'Triggers when a post is published',
					},
				],
				description: 'The event to listen for',
			},
		],
	};

	methods = {
		loadOptions: {
			getBlogs,
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (webhookData.webhookId === undefined) {
					return false;
				}
				return true;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const blogId = this.getNodeParameter('blogId') as string;
				const event = this.getNodeParameter('event') as string;

				const body = {
					hookUrl: webhookUrl,
					// The API expects events as a JSON-stringified array (intentional double-serialization)
					events: JSON.stringify([event]),
					source: 'n8n',
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'dropInBlogOAuth2Api',
					{
						method: 'POST',
						url: `${API_BASE_URL}/v2/blog/${blogId}/webhooks`,
						body,
					},
				);

				if (response.hookId === undefined) {
					return false;
				}

				const webhookData = this.getWorkflowStaticData('node');
				webhookData.webhookId = response.hookId;
				webhookData.blogId = blogId;

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId !== undefined) {
					try {
						await this.helpers.httpRequestWithAuthentication.call(
							this,
							'dropInBlogOAuth2Api',
							{
								method: 'DELETE',
								url: `${API_BASE_URL}/v2/blog/${webhookData.blogId}/webhooks/${webhookData.webhookId}`,
							},
						);
						delete webhookData.webhookId;
						delete webhookData.blogId;
					} catch (error) {
						return false;
					}
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();

		return {
			workflowData: [this.helpers.returnJsonArray(bodyData)],
		};
	}
}
