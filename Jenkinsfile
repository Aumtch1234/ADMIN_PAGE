pipeline {
  agent any

  environment {
    PROJECT_NAME = 'delivery-web'
    DOCKER_COMPOSE = 'docker-compose.yml'
    BUILD_DIR = 'dist'
    NODE_ENV = 'production'
  }

  stages {

    stage('Checkout') {
        steps {
            echo '📥 Pulling latest code from GitHub...'
            git branch: 'main', url: 'https://github.com/Aumtch1234/ADMIN_PAGE.git'
            sh 'git log --oneline -1'
        }
    }

    stage('Create .env for Vite') {
        steps {
            echo '🔐 Creating .env file from Jenkins credentials (web-delivery)...'
            withCredentials([string(credentialsId: 'web-delivery', variable: 'WEB_ENV')]) {
            sh '''
                # เขียนข้อมูลทั้งหมดจาก Jenkins credentials ลงใน .env
                echo "$WEB_ENV" | tr ' ' '\\n' | grep '=' > .env

                echo "✅ .env file created successfully"
                echo "📋 Variables inside .env:"
                cat .env | cut -d'=' -f1
            '''
            }
        }
    }


    stage('Clean old containers') {
      steps {
        echo '🧹 Cleaning old Docker containers...'
        sh '''
          docker compose -f $DOCKER_COMPOSE down -v || true
          docker rm -f ${PROJECT_NAME} 2>/dev/null || true
          docker image prune -f
        '''
      }
    }

    stage('Build Docker image') {
      steps {
        echo '🏗️ Building Docker image for frontend...'
        sh '''
          docker compose -f $DOCKER_COMPOSE build --no-cache
          echo "✅ Build completed successfully"
        '''
      }
    }

    stage('Deploy container') {
      steps {
        echo '🚀 Starting web container...'
        sh '''
          docker compose -f $DOCKER_COMPOSE up -d
          echo "✅ Container started"
          
          echo ""
          echo "📋 Running containers:"
          docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        '''
      }
    }

    stage('Verify deployment') {
      steps {
        echo '🔍 Verifying frontend is up...'
        sh '''
          sleep 5
          CONTAINER=$(docker ps --filter "name=${PROJECT_NAME}" --format "{{.Names}}")
          if [ -z "$CONTAINER" ]; then
            echo "❌ Frontend container not running!"
            exit 1
          fi

          docker logs $CONTAINER --tail=20
        '''
      }
    }
  }

  post {
    success {
      echo '🎉 Frontend (Vite/React) deployment completed successfully!'
      echo '🌐 Application available at http://localhost:5173 or configured port'
    }
    failure {
      echo '❌ Deployment failed!'
      sh 'docker compose -f $DOCKER_COMPOSE logs --tail=100 || true'
    }
    always {
      echo '🧹 Cleaning up sensitive files (.env)...'
      sh 'rm -f .env'
    }
  }
}
