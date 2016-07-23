module Jekyll
  module Maps
    class GoogleMapTag < Liquid::Tag
      JS_LIB_NAME        = "jekyllMaps".freeze
      DEFAULT_MAP_WIDTH  = 600
      DEFAULT_MAP_HEIGHT = 400

      def initialize(_, args, _)
        @args   = OptionsParser.parse(args)
        @finder = LocationFinder.new(@args)
        super
      end

      def render(context)
        locations   = @finder.find(context.registers[:site], context.registers[:page])
        use_cluster = @args[:flags][:no_cluster] ? "false" : "true"
        @args[:attributes][:id] ||= SecureRandom.uuid

        <<HTML
<div #{render_attributes}></div>
<script type='text/javascript'>
  #{JS_LIB_NAME}.register('#{@args[:attributes][:id]}', #{locations.to_json}, #{use_cluster});
</script>
HTML
      end

      private
      def render_attributes
        attributes = []
        attributes << "id='#{@args[:attributes][:id]}'"
        attributes << render_dimensions
        attributes << render_class if @args[:attributes][:class]
        attributes.join(" ")
      end

      private
      def render_dimensions
        width       = @args[:attributes][:width] || DEFAULT_MAP_WIDTH
        height      = @args[:attributes][:height] || DEFAULT_MAP_HEIGHT
        width_unit  = width.to_s.include?("%") ? "" : "px"
        height_unit = height.to_s.include?("%") ? "" : "px"
        %(style='width:#{width}#{width_unit};height:#{height}#{height_unit};')
      end

      private
      def render_class
        css = @args[:attributes][:class]
        css = css.join(" ") if css.is_a?(Array)
        %(class='#{css}')
      end
    end
  end
end

Liquid::Template.register_tag("google_map", Jekyll::Maps::GoogleMapTag)
