pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        IMAGE_NAME = 'your-dockerhub-username/version-echo'
        IMAGE_TAG  = "${BUILD_NUMBER}"
    }

    stages {
        stage('Clone Repo') {
            steps {
                checkout scm
                echo "Checked out branch: ${env.BRANCH_NAME}"
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Push to DockerHub') {
            steps {
                sh "echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin"
                sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker push ${IMAGE_NAME}:latest"
            }
        }

        stage('Update Kubernetes Manifest') {
            steps {
                sh """
                    sed -i 's|${IMAGE_NAME}:.*|${IMAGE_NAME}:${IMAGE_TAG}|g' k8s/deployment.yaml
                """
                sh """
                    git config user.email "jenkins@ci.local"
                    git config user.name "Jenkins"
                    git add k8s/deployment.yaml
                    git commit -m "ci: update image to ${IMAGE_TAG} [skip ci]"
                    git push origin HEAD:main
                """
            }
        }
    }

    post {
        always {
            sh 'docker logout'
        }
        success {
            echo "Pipeline succeeded. Image: ${IMAGE_NAME}:${IMAGE_TAG}"
        }
        failure {
            echo "Pipeline failed at stage: ${env.STAGE_NAME}"
        }
    }
}
