import type {
	IExecuteFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes } from 'n8n-workflow';
import { API_BASE_URL } from './constants';
import { getBlogs } from './GenericFunctions';

export class DropInBlog implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DropInBlog',
		name: 'dropInBlog',
		icon: 'file:logo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with DropInBlog',
		defaults: {
			name: 'DropInBlog',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'dropInBlogOAuth2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Post',
						value: 'post',
					},
				],
				default: 'post',
				description: 'The resource to operate on',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['post'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new blog post',
						action: 'Create a post',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a post by ID or slug',
						action: 'Get a post',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Search blog posts',
						action: 'Search posts',
					},
				],
				default: 'create',
			},
			// Blog ID (shared by create, get, and search)
			{
				displayName: 'Blog',
				name: 'blogId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getBlogs',
				},
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create', 'get', 'search'],
					},
				},
				description:
					'The blog to work with. Choose from the list.',
			},
			// Post ID or Slug (get only)
			{
				displayName: 'Post ID or Slug',
				name: 'postIdentifier',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['get'],
					},
				},
				description: 'The numeric ID or slug of the post to retrieve',
			},
			// Title (create only)
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
					},
				},
				description: 'The title of the post',
			},
			// Content (create only)
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
					},
				},
				description: 'The HTML content of the post',
			},
			// Search Query (search only)
			{
				displayName: 'Search Query',
				name: 'search',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['search'],
					},
				},
				description: 'The search query to find posts',
			},
			// Additional Fields (create only)
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Author Name',
						name: 'author_name',
						type: 'string',
						default: '',
						description:
							'The name of the author (will create or find existing author by name)',
					},
					{
						displayName: 'Category Names',
						name: 'category_names',
						type: 'string',
						default: '',
						description:
							'Comma separated list of category names to attach to your post (will create categories if they do not exist)',
					},
					{
						displayName: 'Featured Image URL',
						name: 'featured_image',
						type: 'string',
						default: '',
						description: 'URL of the featured image',
					},
					{
						displayName: 'Keyword',
						name: 'keyword',
						type: 'string',
						default: '',
						description: 'Primary SEO keyword for the post',
					},
					{
						displayName: 'SEO Title',
						name: 'seo_title',
						type: 'string',
						default: '',
						description: 'Meta title for SEO (defaults to post title)',
					},
					{
						displayName: 'SEO Description',
						name: 'seo_description',
						type: 'string',
						typeOptions: {
							rows: 3,
						},
						default: '',
						description: 'Meta description for SEO',
					},
					{
						displayName: 'Slug',
						name: 'slug',
						type: 'string',
						default: '',
						description: 'URL slug for the post (auto generated from title if not provided)',
					},
					{
						displayName: 'Status',
						name: 'status_id',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getStatuses',
						},
						default: '',
						description:
							'The status of the post. Choose from the list.',
					},
				],
			},
			// Search Filters (search only)
			{
				displayName: 'Filters',
				name: 'searchFilters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['search'],
					},
				},
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{
								name: 'Draft',
								value: 'draft',
							},
							{
								name: 'Published',
								value: 'published',
							},
						],
						default: '',
						description: 'Filter by post status',
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 50,
						},
						default: 20,
						description: 'Max number of results to return (max 50)',
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			getBlogs,

			async getStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const statuses = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'dropInBlogOAuth2Api',
					{
						method: 'GET',
						url: `${API_BASE_URL}/v2/automations/statuses`,
					},
				);
				for (const status of statuses as IDataObject[]) {
					returnData.push({
						name: status.name as string,
						value: status.id as number,
					});
				}
				return returnData;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				if (resource === 'post') {
					if (operation === 'create') {
						const blogId = this.getNodeParameter('blogId', i) as string;
						const title = this.getNodeParameter('title', i) as string;
						const content = this.getNodeParameter('content', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const body: IDataObject = {
							title,
							content,
							...Object.fromEntries(
								Object.entries(additionalFields).filter(([, v]) => v !== undefined && v !== ''),
							),
						};

						// the write endpoint for posts
						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'dropInBlogOAuth2Api',
							{
								method: 'POST',
								url: `${API_BASE_URL}/v2/blog/${blogId}/posts`,
								body,
							},
						);

						const executionData = this.helpers.constructExecutionMetaData(
							this.helpers.returnJsonArray(response as IDataObject),
							{ itemData: { item: i } },
						);
						returnData.push(...executionData);
					} else if (operation === 'get') {
						const blogId = this.getNodeParameter('blogId', i) as string;
						const postIdentifier = this.getNodeParameter('postIdentifier', i) as string;

						// the read endpoint for individual posts
						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'dropInBlogOAuth2Api',
							{
								method: 'GET',
								url: `${API_BASE_URL}/v2/automations/${blogId}/posts/${encodeURIComponent(postIdentifier)}`,
							},
						);

						const executionData = this.helpers.constructExecutionMetaData(
							this.helpers.returnJsonArray(response as IDataObject),
							{ itemData: { item: i } },
						);
						returnData.push(...executionData);
					} else if (operation === 'search') {
						const blogId = this.getNodeParameter('blogId', i) as string;
						const search = this.getNodeParameter('search', i) as string;
						const searchFilters = this.getNodeParameter('searchFilters', i) as IDataObject;

						const qs: IDataObject = { search };
						if (searchFilters.status) {
							qs.status = searchFilters.status;
						}
						if (searchFilters.limit) {
							qs.limit = searchFilters.limit;
						}

						// the read/search endpoint for posts
						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'dropInBlogOAuth2Api',
							{
								method: 'GET',
								url: `${API_BASE_URL}/v2/automations/${blogId}/posts/search`,
								qs,
							},
						);

						const executionData = this.helpers.constructExecutionMetaData(
							this.helpers.returnJsonArray(response as IDataObject[]),
							{ itemData: { item: i } },
						);
						returnData.push(...executionData);
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject);
			}
		}

		return [returnData];
	}
}
