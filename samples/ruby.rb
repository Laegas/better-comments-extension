# typed: false

# Test Method
# * Important information is highlighted
# ! Deprecated method, do not use
# ? Should this method be exposed through API?
# TODO: refactor this method to conform to API
# @param param The parameter for this method

class DocsApiController < ActionController::Base
  include Swagger::Blocks

  swagger_root do
    key :swagger, '2.0'
    info do
      key :title, 'Capdesk'
      key :description, 'Internal Capdesk API Documentation'
      key :version, '1.0'
    end
    key :host,
        CapdeskConfig.base_url ||
        ("#{ENV['HEROKU_APP_NAME']}.herokuapp.com" if ENV['HEROKU_APP_NAME']) ||
        'localhost:5005'
    key :basePath, '/api'
    key :consumes, ['application/json']
    key :produces, ['application/json']
    security_definition :api_key do
      key :type, :apiKey
      key :name, :cookie
      key :in, :header
    end
    security do
      key :api_key, []
    end

    # Parameters for reuse
    parameter :generic_path_id do
      key :in, :path
      key :name, :id
      key :description, 'Generic path ID'
      key :required, true
      key :type, :integer
    end
    parameter :user_id do
      key :in, :path
      key :name, :id
      key :description, 'User ID - can be `current` for current user'
      key :required, true
      key :type, :string
    end
  end

  # Find all classes that have swagger_* declarations.
  # 0. init array of swaggered classes
  SWAGGERED_CLASSES = []
  # 1. iterate through all .rb files
  Dir[Rails.root.join('app/controllers/**/*.rb').to_s, Rails.root.join('app/models/**/*.rb').to_s].each do |filename|
    # 2. consider only if swagger_path or swagger_schema is somewhere in the .rb file
    next unless File.foreach(filename).grep(/swagger_path|swagger_schema/).any?

    # 3. find the first class or module name (assuming first is enough)
    klass = File.foreach(filename) do |x|
      matches = x.match(/^(?:class|module) +(.+?)(?: < .*)?$/)
      break matches[1] if matches.present?
    end

    # 4. turn found string into constant
    klass = klass.safe_constantize
    next if klass.nil?

    # 5. check if it relates to Swagger Blocks
    next unless klass.ancestors.include?(Swagger::Blocks)

    # 6. add it
    SWAGGERED_CLASSES << klass
  end

  def index
    render json: Swagger::Blocks.build_root_json(SWAGGERED_CLASSES)
  end
end