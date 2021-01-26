import * as cdk from '@aws-cdk/core';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';

export interface ChromeCastStackProps extends cdk.StackProps {
  rootFile: string
  s3Path?: string
  bucketName: string
  originAccessIdName: string
}

export class ChromeCastStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ChromeCastStackProps = {
    rootFile: 'index.html',
    bucketName: 'chromecast.development.mediazilla.com',
    originAccessIdName: 'E34T19MGRH5YMZ'
  }) {
    super(scope, id, props);


    // The code that defines your stack goes here
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      bucketName: props.bucketName
    });
    
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../website')],
      destinationBucket: websiteBucket,
    });

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: { origin: new origins.S3Origin(websiteBucket) },
      defaultRootObject: props.rootFile
    });
  }
}
