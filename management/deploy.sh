
BUCKET_KEY=lambda.zip

chmod -R +x ./
zip -r ./$BUCKET_KEY *

echo $AWS_ACCESS_KEY_ID 
aws s3 cp $BUCKET_KEY s3://$BUCKET/$BUCKET_KEY
aws lambda update-function-code --function-name tf-pomodoro-features-watcher --s3-bucket $BUCKET --s3-key $BUCKET_KEY