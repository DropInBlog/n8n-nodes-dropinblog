import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';
import { API_BASE_URL } from './constants';

export async function getBlogs(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const returnData: INodePropertyOptions[] = [];
	const blogs = await this.helpers.httpRequestWithAuthentication.call(
		this,
		'dropInBlogOAuth2Api',
		{
			method: 'GET',
			url: `${API_BASE_URL}/v2/automations/blogs`,
		},
	);
	for (const blog of blogs as IDataObject[]) {
		returnData.push({
			name: blog.name as string,
			value: blog.id as string,
		});
	}
	return returnData;
}
