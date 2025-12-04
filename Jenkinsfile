pipeline {
  agent any

  environment {
    SONAR_TOKEN = credentials('sonar-token')
    VERCEL_TOKEN = credentials('vercel-token')
  }

  stages {
    stage("Instalar npm y nodejs") {
        sh 'apt-get update && apt-get install -y nodejs npm'
    }
    stage('Instalar dependencias') {
      steps {
        sh 'npm install'
      }
    }

    stage('Build') {
      when {
        anyOf {
          branch 'main'
          branch 'develop'
        }
      }
      steps {
        sh 'npm run build'
      }
    }

    stage('SonarQube') {
      when {
        anyOf {
          branch 'main'
          branch 'develop'
        }
      }
      steps {
        withSonarQubeEnv('SonarQube') {
          sh '''
            sonar-scanner \
              -Dsonar.projectKey=clima-pwa \
              -Dsonar.sources=src \
              -Dsonar.host.url=http://sonarqube:9000 \
              -Dsonar.login=$SONAR_TOKEN
          '''
        }
      }
    }

    stage('Deploy a Vercel (solo se hace push a main)') {
      when {
        branch 'main'
      }
      steps {
        sh '''
          npm install -g vercel
          vercel --prod --yes --token=$VERCEL_TOKEN
        '''
      }
    }
  }
}
