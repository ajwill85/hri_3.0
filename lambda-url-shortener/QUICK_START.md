# Quick Start: API Gateway Setup via AWS Console

Follow these steps to configure API Gateway through the AWS Console.

## Step 1: Open API Gateway Console

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **API Gateway**
3. Select your existing API (the one serving `/prod/news`)

## Step 2: Create `/share` Resource

1. In the left sidebar, click **Resources**
2. Select the root `/` resource
3. Click **Actions** → **Create Resource**
4. Configure:
   - **Resource Name**: `share`
   - **Resource Path**: `/share`
   - ✅ **Enable API Gateway CORS**
5. Click **Create Resource**

## Step 3: Create POST Method (Create Short Link)

1. Select the `/share` resource you just created
2. Click **Actions** → **Create Method**
3. Select **POST** from dropdown
4. Click the checkmark ✓
5. Configure Integration:
   - **Integration type**: Lambda Function
   - **Use Lambda Proxy integration**: ✅ (check this!)
   - **Lambda Region**: `us-east-2`
   - **Lambda Function**: `hri-url-shortener`
6. Click **Save**
7. Click **OK** when prompted to give API Gateway permission to invoke Lambda

## Step 4: Create `{shortCode}` Resource

1. Select the `/share` resource
2. Click **Actions** → **Create Resource**
3. Configure:
   - **Resource Name**: `shortCode`
   - **Resource Path**: `{shortCode}` (include the curly braces!)
   - ✅ **Enable API Gateway CORS**
4. Click **Create Resource**

## Step 5: Create GET Method (Retrieve Article)

1. Select the `/{shortCode}` resource you just created
2. Click **Actions** → **Create Method**
3. Select **GET** from dropdown
4. Click the checkmark ✓
5. Configure Integration:
   - **Integration type**: Lambda Function
   - **Use Lambda Proxy integration**: ✅ (check this!)
   - **Lambda Region**: `us-east-2`
   - **Lambda Function**: `hri-url-shortener`
6. Click **Save**
7. Click **OK** when prompted to give API Gateway permission

## Step 6: Deploy API

1. Click **Actions** → **Deploy API**
2. **Deployment stage**: `prod`
3. Click **Deploy**

## Step 7: Test Your Endpoints

Your endpoints are now available at:
- **POST**: `https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod/share`
- **GET**: `https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod/share/{shortCode}`

### Test with curl:

```bash
# Create a short link
curl -X POST https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod/share \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article",
    "description": "Test description",
    "source": "Test Source",
    "url": "https://example.com",
    "pubDate": "2026-01-22T12:00:00Z",
    "categories": ["Test"]
  }'

# Should return something like:
# {"success":true,"shortCode":"a7Bx9K","shortUrl":"https://humanriskintel.com/s/a7Bx9K","expiresAt":1740240000}

# Then test retrieving it (replace a7Bx9K with your actual code):
curl https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod/share/a7Bx9K
```

## Step 8: Update Frontend

Update your `.env` file with your API endpoint:
```bash
VITE_SHORTENER_API_ENDPOINT=https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod/share
```

No changes needed! Just deploy your frontend:
```bash
npm run build
./deploy-frontend.sh
```

## Troubleshooting

### CORS Errors
If you get CORS errors:
1. Go to each resource (`/share` and `/{shortCode}`)
2. Click **Actions** → **Enable CORS**
3. Click **Enable CORS and replace existing CORS headers**
4. Deploy API again

### 403 Forbidden
- Make sure you clicked **OK** when API Gateway asked to add Lambda permissions
- Check CloudWatch Logs: `/aws/lambda/hri-url-shortener`

### 502 Bad Gateway
- Check Lambda function logs in CloudWatch
- Verify environment variables are set (TABLE_NAME, BASE_URL)

## Done! 🎉

Once you complete these steps:
1. Test the endpoints with curl
2. Deploy your frontend
3. Try sharing an article from the UI
4. Open the short link in a new tab

The short links will be ~38 characters instead of ~600 characters!
