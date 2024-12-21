import { NugetDatasource } from 'renovate/dist/modules/datasource/nuget/index.js';
import { api as nugetVersioning } from 'renovate/dist/modules/versioning/nuget/index.js';
import { table } from 'table';

async function main(packageName) {
    if (!packageName) {
        console.log("ERROR: You MUST provide a package name.");
        return;
    }

    console.log(`Getting the ${packageName} package releases...`)

    const dataSource = new NugetDatasource();

    const releases = await dataSource.getReleases({
        packageName: packageName,
        registryUrl: "https://community.chocolatey.org/api/v2",
    });

    if (!releases) {
        console.log("No releases found.");
        return;
    }

    const topReleases = releases.releases.sort((a, b) => -nugetVersioning.sortVersions(a.version, b.version)).slice(0, 10).map(release => [
        release.releaseTimestamp.replace("T", " ").padEnd(23, '0'),
        release.version,
    ]);

    console.log(table([['date', 'version'], ...topReleases], {
        header: {
            alignment: 'center',
            content: `${packageName} latest ten releases\n${releases.sourceUrl}`,
        },
        drawHorizontalLine: (lineIndex, rowCount) => lineIndex <= 2 || lineIndex == rowCount,
    }));
}

await main(process.argv[2]);
