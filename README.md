use prisma to migrate on local.
use wrangler to migrate on production.
```sh
bun prisma reset
bun prisma migrate

# remove PRAGMA lines before migration
bunx zx scripts/migration_apply.mjs

bun run pages:deploy
```


# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Development

You will be utilizing Wrangler for local development to emulate the Cloudflare runtime. This is already wired up in your package.json as the `dev` script:

```sh
# start the remix dev server and wrangler
bun dev
```

Open up [http://127.0.0.1:8788](http://127.0.0.1:8788) and you should be ready to go!

## Deployment

Cloudflare Pages are currently only deployable through their Git provider integrations.

If you don't already have an account, then [create a Cloudflare account here](https://dash.cloudflare.com/sign-up/pages) and after verifying your email address with Cloudflare, go to your dashboard and follow the [Cloudflare Pages deployment guide](https://developers.cloudflare.com/pages/framework-guides/deploy-anything).

Configure the "Build command" should be set to `npm run build`, and the "Build output directory" should be set to `public`.

```ruby
module MyGraph
  def self.gen(kaller, filename:)
    kaller = caller
    require "json"

    filename = "my_file.json"
    outfile_path = Rails.root.join('tmp', filename)

    unless File.exist?(outfile_path)
      File.open(outfile_path, "w")
    end

    File.open(outfile_path, 'r+') { |file|
      file_content = file.read
      existent_method_calls = begin
        JSON.parse(file_content)
      rescue JSON::ParserError
        []
      end

      file.reopen(outfile_path, 'w')

      filtered = kaller.filter { |trace|
        pp trace
        trace.include?(Rails.root.to_s) && !trace.include?('spec') && !trace.include?('vendor')
      }

      to_class_name = ->(trace) {
        controller = trace.split(":").first
        _line_number = trace.split(":").second
        method = trace.gsub(/.*`/, "").gsub(/'.*$/, "")

        "#{controller.delete_prefix(Rails.root.to_s)}##{method}"
      }

      method_calls = filtered.each_cons(2).map { |callee_trace, caller_trace|
        {
          caller: to_class_name.call(caller_trace),
          callee: to_class_name.call(callee_trace),
        }
      }

      existent_method_calls.concat(method_calls)
      existent_method_calls.uniq!

      file.truncate(0)
      file.puts(JSON.generate(existent_method_calls))
    }
  end
end
```
