pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('sonar-token') 
        VERCEL_TOKEN = credentials('vercel-token')
    }

    stages {

        stage("Instalar npm y nodejs") {
            steps {
                sh 'apt-get update && apt-get install -y nodejs npm'
            }
        }
        
        stage('Instalar dependencias') {
            steps {
                sh 'npm install' 
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                    npx sonar-scanner \\
                      -Dsonar.projectKey=am-majo \\
                      -Dsonar.sources=src \\
                      -Dsonar.host.url=http://sonarqube:9000 \\
                      -Dsonar.exclusions=**/*.test.jsx,**/*.spec.js,**/setupTests.js
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Deploy a Vercel') {
            when {
                expression { 
                    return env.GIT_BRANCH == 'origin/main' || env.GIT_BRANCH == 'main' 
                }
            }
            steps {
                echo "🚀 Desplegando a Producción (Rama: ${env.GIT_BRANCH})"
                sh 'npx vercel deploy --prod --token=$VERCEL_TOKEN --yes'
            }
        }
    }
}