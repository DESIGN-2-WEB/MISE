// Mise CI/CD on Jenkins with Docker available on PATH.
// Lint -> build the image -> replace the running container -> check the site responds.

pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    skipDefaultCheckout()
  }

  parameters {
    string(name: 'PORT', defaultValue: '8088', description: 'Port the site is served on')
  }

  environment {
    DOCKER_CONFIG = "${WORKSPACE}\\.docker-config"
    IMAGE = 'mise-web'
    SITE_PORT = "${params.PORT ?: '8088'}"
  }

  stages {
    stage('Get source') {
      steps {
        checkout scm
        bat 'docker version && docker compose version'
      }
    }

    stage('Lint') {
      steps {
        bat 'docker build --target lint -t %IMAGE%:lint .'
      }
    }

    stage('Build image') {
      steps {
        bat 'docker build -t %IMAGE%:%BUILD_NUMBER% -t %IMAGE%:latest .'
      }
    }

    stage('Deploy') {
      steps {
        // Same compose project name as running `docker compose up` by hand, so it replaces that container.
        bat 'docker compose -p mise-main up -d --no-build --force-recreate'
      }
    }

    stage('Smoke test') {
      steps {
        powershell '''
          $base = "http://localhost:$env:SITE_PORT"
          foreach ($i in 1..10) {
            try { Invoke-WebRequest "$base/" -UseBasicParsing -TimeoutSec 5 | Out-Null; break }
            catch { Start-Sleep -Seconds 2 }
          }
          foreach ($path in '/', '/recipes', '/about', '/sw.js') {
            $r = Invoke-WebRequest "$base$path" -UseBasicParsing -TimeoutSec 10
            Write-Host "$path -> $($r.StatusCode)"
          }
          try { Invoke-WebRequest "$base/no-such-page" -UseBasicParsing | Out-Null; throw "Unknown page did not return 404" }
          catch [System.Net.WebException] {
            if ($_.Exception.Response.StatusCode.value__ -ne 404) { throw }
            Write-Host "/no-such-page -> 404"
          }
        '''
      }
    }
  }

  post {
    success { echo "Mise is live at http://localhost:${env.SITE_PORT}" }
    always {
      bat(script: 'docker image prune -f', returnStatus: true)
    }
  }
}
