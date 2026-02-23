module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['n8n-nodes-base'],
	extends: ['plugin:n8n-nodes-base/community'],
	ignorePatterns: ['.eslintrc.js', 'gulpfile.js', 'dist/**/*'],
	rules: {
		'n8n-nodes-base/community-package-json-name-still-default': 'off',
	},
};
