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
      websiteIndexDocument: props.rootFile,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      bucketName: props.bucketName
    });
    
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../website')],
      destinationBucket: websiteBucket,
    });

    const distr = this.cloudfront(websiteBucket, props);
  }

  private cloudfront(bucket: s3.Bucket, props: ChromeCastStackProps) {
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: { origin: new origins.S3Origin(bucket) },
      defaultRootObject: props.rootFile
    });
    
    const originAccessIdentity = cloudfront.OriginAccessIdentity.fromOriginAccessIdentityName(this, 'OAI', props.originAccessIdName)
    // Option 3 (Stable): Use this version if the bucket does not have website hosting enabled.
    const distribution_for_bucket = new cloudfront.CloudFrontWebDistribution(this, 'DistributionForBucket', {
      
      originConfigs: [
        {
          s3OriginSource: {
            originAccessIdentity,
            s3BucketSource: bucket,
          },
          behaviors : [ {isDefaultBehavior: true}]
        }
      ]
    });

    return {
      distribution,
      distribution_for_bucket
    }
  }
}
